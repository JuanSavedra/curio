import { useEffect, useState, type CSSProperties } from 'react';
import type { Tema } from '../../data/temas';
import { IconeTema } from '../feed/Icones';

/** Círculo da cor do tema com o ícone dentro. Decorativo: o nome do tema vem sempre ao lado. */
export function SeloTema({ tema, tamanho = 3, ligado = false }: { tema: Tema; tamanho?: number; ligado?: boolean }) {
	return (
		<span
			className={`selo-tema${ligado ? ' selo-tema--claro' : ''}`}
			style={{ '--selo': `${tamanho}rem` } as CSSProperties}
			aria-hidden="true"
		>
			<IconeTema tema={tema} tamanho={Math.round(tamanho * 9)} />
		</span>
	);
}

/**
 * Barra de progresso. É decorativa: a contagem em texto ao lado diz o mesmo.
 * Enche uma vez ao aparecer, só com transform.
 */
export function Barra({ valor }: { valor: number }) {
	const [ligada, setLigada] = useState(false);
	useEffect(() => {
		const quadro = requestAnimationFrame(() => setLigada(true));
		return () => cancelAnimationFrame(quadro);
	}, []);
	return (
		<div className="barra" aria-hidden="true">
			<div className="barra__cheio" style={{ '--p': ligada ? valor : 0 } as CSSProperties} />
		</div>
	);
}
