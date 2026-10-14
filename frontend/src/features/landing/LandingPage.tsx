import { Cierre } from './secciones/Cierre'
import { Collage } from './secciones/Collage'
import { Escena } from './secciones/Escena'
import { Footer } from './secciones/Footer'
import { Hero } from './secciones/Hero'
import { Navbar } from './secciones/Navbar'

export function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Escena />
      <Collage />
      <Cierre />
      <Footer />
    </>
  )
}
