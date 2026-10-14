import { Component } from 'react'
import type { ReactNode } from 'react'

import estilos from './LimiteDeError.module.css'

interface LimiteDeErrorProps {
  children: ReactNode
  respaldo?: (reintentar: () => void) => ReactNode
}

interface LimiteDeErrorState {
  error: Error | null
}

export class LimiteDeError extends Component<LimiteDeErrorProps, LimiteDeErrorState> {
  override state: LimiteDeErrorState = { error: null }

  static getDerivedStateFromError(error: Error): LimiteDeErrorState {
    return { error }
  }

  reintentar = (): void => {
    this.setState({ error: null })
  }

  override render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.respaldo) return this.props.respaldo(this.reintentar)

    return (
      <div className={estilos.contenedor} role="alert">
        <h2 className={estilos.titulo}>Algo salió mal</h2>
        <p className={estilos.mensaje}>{error.message}</p>
        <button type="button" className={estilos.boton} onClick={this.reintentar}>
          Reintentar
        </button>
      </div>
    )
  }
}
