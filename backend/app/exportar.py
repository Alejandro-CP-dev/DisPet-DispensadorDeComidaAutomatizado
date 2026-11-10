from __future__ import annotations

from datetime import datetime
from html import escape
from io import BytesIO
from typing import TYPE_CHECKING, Literal, Mapping, Sequence
from zoneinfo import ZoneInfo

if TYPE_CHECKING:
    from app.main import Dispensacion

FormatoExportacion = Literal["xlsx", "pdf", "docx"]

ZONA_HORARIA = ZoneInfo("America/Bogota")
COLOR_CAFE = "8A5A1F"
COLOR_CREMA = "FAF4EC"
COLOR_ROJO = "B85450"
ENCABEZADOS = ["Fecha", "Hora", "Mascota", "Dispensador", "Gramos", "Tipo", "Estado"]


def _fecha_local(registro: Dispensacion) -> datetime:
    fecha = registro.fechaHora
    if fecha.tzinfo is None:
        fecha = fecha.replace(tzinfo=ZoneInfo("UTC"))
    return fecha.astimezone(ZONA_HORARIA)


def _valores_fila(
    registro: Dispensacion,
    mascota_por_id: Mapping[str, str],
    dispositivo_por_id: Mapping[str, str],
) -> list:
    fecha = _fecha_local(registro)
    return [
        fecha.date(),
        fecha.time().replace(tzinfo=None),
        mascota_por_id.get(registro.mascotaId, "—"),
        dispositivo_por_id.get(registro.dispositivoId, "—"),
        float(registro.gramos),
        "Programada" if registro.tipo == "programada" else "Manual",
        "Exitosa" if registro.estado == "exitosa" else "Fallida",
    ]


def _resumen(registros: Sequence[Dispensacion]) -> tuple[int, int, int, float]:
    return (
        len(registros),
        sum(registro.estado == "exitosa" for registro in registros),
        sum(registro.estado == "fallida" for registro in registros),
        sum(registro.gramos for registro in registros),
    )


def _crear_excel(
    registros: Sequence[Dispensacion],
    usuario: str,
    generado: datetime,
    filtros: str,
    mascotas: Mapping[str, str],
    dispositivos: Mapping[str, str],
) -> bytes:
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    libro = Workbook()
    hoja = libro.active
    hoja.title = "Historial"
    hoja.merge_cells("A1:G1")
    hoja["A1"] = "DisPet – Historial de comidas"
    hoja["A1"].font = Font(size=16, bold=True, color=COLOR_CAFE)
    hoja["A2"] = "Usuario"
    hoja["B2"] = usuario
    hoja["B2"].data_type = "s"
    hoja["A3"] = "Generado"
    hoja["B3"] = generado.replace(tzinfo=None)
    hoja["B3"].number_format = "dd/mm/yyyy hh:mm"
    hoja["A4"] = "Filtros aplicados"
    hoja["B4"] = filtros
    hoja.merge_cells("B4:G4")
    hoja["A6"] = "Resumen"
    hoja["A6"].font = Font(bold=True, color=COLOR_CAFE)
    resumen_titulos = ["Total de comidas", "Exitosas", "Fallidas", "Total de gramos"]
    resumen = _resumen(registros)
    for columna, (titulo, valor) in enumerate(zip(resumen_titulos, resumen), start=1):
        hoja.cell(7, columna, titulo)
        celda = hoja.cell(8, columna, valor)
        celda.font = Font(bold=True)
        if columna == 4:
            celda.number_format = "0.##"

    fila_encabezado = 10
    for columna, encabezado in enumerate(ENCABEZADOS, start=1):
        celda = hoja.cell(fila_encabezado, columna, encabezado)
        celda.fill = PatternFill("solid", fgColor=COLOR_CAFE)
        celda.font = Font(bold=True, color="FFFFFF")
        celda.alignment = Alignment(horizontal="center")

    fila_datos = fila_encabezado + 1
    for indice, registro in enumerate(registros):
        fila = fila_datos + indice
        valores = _valores_fila(registro, mascotas, dispositivos)
        for columna, valor in enumerate(valores, start=1):
            celda = hoja.cell(fila, columna, valor)
            if isinstance(valor, str):
                celda.data_type = "s"
            if indice % 2 == 0:
                celda.fill = PatternFill("solid", fgColor=COLOR_CREMA)
            if registro.estado == "fallida":
                celda.fill = PatternFill("solid", fgColor="FCE4D6")
                celda.font = Font(color=COLOR_ROJO)
        hoja.cell(fila, 1).number_format = "dd/mm/yyyy"
        hoja.cell(fila, 2).number_format = "hh:mm:ss"
        hoja.cell(fila, 5).number_format = "0.##"

    fila_total = fila_datos + max(len(registros), 1)
    hoja.cell(fila_total, 4, "TOTAL")
    hoja.cell(fila_total, 5, f"=SUM(E{fila_datos}:E{fila_total - 1})")
    for celda in hoja[fila_total]:
        celda.font = Font(bold=True, color=COLOR_CAFE)
    hoja.cell(fila_total, 5).number_format = "0.##"
    ultima_fila_datos = fila_datos + len(registros) - 1
    hoja.auto_filter.ref = (
        f"A{fila_encabezado}:G{max(fila_encabezado, ultima_fila_datos)}"
    )
    hoja.freeze_panes = f"A{fila_encabezado + 1}"

    for columna in range(1, len(ENCABEZADOS) + 1):
        letra = get_column_letter(columna)
        ancho = max(
            len(str(hoja.cell(fila, columna).value or ""))
            for fila in range(fila_encabezado, ultima_fila_datos + 1)
        )
        hoja.column_dimensions[letra].width = min(max(ancho + 2, 12), 40)

    salida = BytesIO()
    libro.save(salida)
    return salida.getvalue()


def _crear_pdf(
    registros: Sequence[Dispensacion],
    usuario: str,
    generado: datetime,
    filtros: str,
    mascotas: Mapping[str, str],
    dispositivos: Mapping[str, str],
) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import landscape, letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
    from reportlab.pdfgen.canvas import Canvas

    class CanvasNumerado(Canvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._paginas_guardadas = []

        def showPage(self):
            self._paginas_guardadas.append(dict(self.__dict__))
            self._startPage()

        def save(self):
            total = len(self._paginas_guardadas)
            for pagina in self._paginas_guardadas:
                self.__dict__.update(pagina)
                self.saveState()
                self.setFont("Helvetica", 9)
                self.drawCentredString(
                    self._pagesize[0] / 2,
                    0.3 * inch,
                    f"Página {self._pageNumber} de {total}",
                )
                self.restoreState()
                Canvas.showPage(self)
            Canvas.save(self)

    salida = BytesIO()
    documento = SimpleDocTemplate(
        salida,
        pagesize=landscape(letter),
        leftMargin=0.4 * inch,
        rightMargin=0.4 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.6 * inch,
    )
    estilos = getSampleStyleSheet()
    titulo = ParagraphStyle(
        "TituloDisPet",
        parent=estilos["Title"],
        textColor=colors.HexColor(f"#{COLOR_CAFE}"),
        alignment=TA_CENTER,
        fontSize=16,
    )
    story = [
        Paragraph("DisPet – Historial de comidas", titulo),
        Spacer(1, 10),
        Paragraph(f"<b>Usuario:</b> {escape(usuario)}", estilos["BodyText"]),
        Paragraph(
            f"<b>Generado:</b> {generado.strftime('%d/%m/%Y %H:%M')} (hora de Colombia)",
            estilos["BodyText"],
        ),
        Paragraph(f"<b>Filtros aplicados:</b> {escape(filtros)}", estilos["BodyText"]),
    ]
    total, exitosas, fallidas, gramos = _resumen(registros)
    story.extend(
        [
            Spacer(1, 8),
            Paragraph(
                f"<b>Resumen:</b> Total de comidas: {total} · Exitosas: {exitosas} · "
                f"Fallidas: {fallidas} · Total de gramos: {gramos:g}",
                estilos["BodyText"],
            ),
            Spacer(1, 12),
        ]
    )

    if registros:
        filas = [ENCABEZADOS]
        filas.extend(
            [
                [
                    _fecha_local(registro).strftime("%d/%m/%Y"),
                    _fecha_local(registro).strftime("%H:%M:%S"),
                    mascotas.get(registro.mascotaId, "—"),
                    dispositivos.get(registro.dispositivoId, "—"),
                    f"{registro.gramos:g}",
                    "Programada" if registro.tipo == "programada" else "Manual",
                    "Exitosa" if registro.estado == "exitosa" else "Fallida",
                ]
                for registro in registros
            ]
        )
        tabla = Table(
            filas,
            repeatRows=1,
            colWidths=[0.85 * inch, 0.72 * inch, 1.15 * inch, 1.45 * inch,
                       0.65 * inch, 0.85 * inch, 0.78 * inch],
        )
        comandos = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(f"#{COLOR_CAFE}")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D9C7B3")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(f"#{COLOR_CREMA}")]),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
        for numero_fila, registro in enumerate(registros, start=1):
            if registro.estado == "fallida":
                comandos.append(("TEXTCOLOR", (6, numero_fila), (6, numero_fila), colors.HexColor(f"#{COLOR_ROJO}")))
        tabla.setStyle(TableStyle(comandos))
        story.append(tabla)
    else:
        story.append(Paragraph("No hay registros con los filtros seleccionados.", estilos["BodyText"]))

    documento.build(story, canvasmaker=CanvasNumerado)
    return salida.getvalue()


def _crear_word(
    registros: Sequence[Dispensacion],
    usuario: str,
    generado: datetime,
    filtros: str,
    mascotas: Mapping[str, str],
    dispositivos: Mapping[str, str],
) -> bytes:
    from docx import Document
    from docx.enum.section import WD_ORIENT
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.shared import Inches, RGBColor

    documento = Document()
    seccion = documento.sections[0]
    seccion.orientation = WD_ORIENT.LANDSCAPE
    seccion.page_width, seccion.page_height = seccion.page_height, seccion.page_width
    seccion.footer_distance = Inches(0.3)
    pie = seccion.footer.paragraphs[0]
    pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pie.add_run("Página ")
    campo = OxmlElement("w:fldSimple")
    campo.set(qn("w:instr"), "PAGE")
    pie._p.append(campo)

    titulo = documento.add_heading("DisPet – Historial de comidas", level=1)
    titulo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    titulo.runs[0].font.color.rgb = RGBColor.from_string(COLOR_CAFE)
    documento.add_paragraph(f"Usuario: {usuario}")
    documento.add_paragraph(
        f"Generado: {generado.strftime('%d/%m/%Y %H:%M')} (hora de Colombia)"
    )
    documento.add_paragraph(f"Filtros aplicados: {filtros}")
    total, exitosas, fallidas, gramos = _resumen(registros)
    resumen = documento.add_paragraph()
    resumen.add_run("Resumen: ").bold = True
    resumen.add_run(
        f"Total de comidas: {total} · Exitosas: {exitosas} · "
        f"Fallidas: {fallidas} · Total de gramos: {gramos:g}"
    )

    if registros:
        tabla = documento.add_table(rows=1, cols=len(ENCABEZADOS))
        tabla.style = "Table Grid"
        for celda, encabezado in zip(tabla.rows[0].cells, ENCABEZADOS):
            celda.text = encabezado
            propiedades = celda._tc.get_or_add_tcPr()
            sombreado = OxmlElement("w:shd")
            sombreado.set(qn("w:fill"), COLOR_CAFE)
            propiedades.append(sombreado)
            for run in celda.paragraphs[0].runs:
                run.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
        for indice, registro in enumerate(registros):
            fila = tabla.add_row()
            valores = _valores_fila(registro, mascotas, dispositivos)
            valores[0] = _fecha_local(registro).strftime("%d/%m/%Y")
            valores[1] = _fecha_local(registro).strftime("%H:%M:%S")
            for numero, (celda, valor) in enumerate(zip(fila.cells, valores)):
                celda.text = str(valor)
                propiedades = celda._tc.get_or_add_tcPr()
                sombreado = OxmlElement("w:shd")
                sombreado.set(
                    qn("w:fill"),
                    "FCE4D6" if registro.estado == "fallida"
                    else COLOR_CREMA if indice % 2 == 0
                    else "FFFFFF",
                )
                propiedades.append(sombreado)
                if registro.estado == "fallida" and numero == 6:
                    for run in celda.paragraphs[0].runs:
                        run.font.color.rgb = RGBColor.from_string(COLOR_ROJO)
    else:
        documento.add_paragraph("No hay registros con los filtros seleccionados.")

    salida = BytesIO()
    documento.save(salida)
    return salida.getvalue()


def exportar_historial(
    formato: FormatoExportacion,
    registros: Sequence[Dispensacion],
    usuario: str,
    generado: datetime,
    filtros: str,
    mascotas: Mapping[str, str],
    dispositivos: Mapping[str, str],
) -> bytes:
    if formato == "xlsx":
        return _crear_excel(registros, usuario, generado, filtros, mascotas, dispositivos)
    if formato == "pdf":
        return _crear_pdf(registros, usuario, generado, filtros, mascotas, dispositivos)
    return _crear_word(registros, usuario, generado, filtros, mascotas, dispositivos)
