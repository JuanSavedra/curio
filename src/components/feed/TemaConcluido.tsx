import { useEffect, useRef, useState } from 'react';
import { TEMAS, corDoTema, type Tema } from '../../data/temas';
import { rotaDosTemas } from '../../lib/rotas';
import { Curio } from './Curio';
import { IconeCerto, IconeRecomecar, IconeSetaDireita } from './Icones';
import { Penas } from './Penas';

interface Props {
	tema: Tema;
	total: number;
	onRever: () => void;
}

/**
 * O fim de um tema: a cor dele se espalha a partir do Curió e a tela inteira vira a cor do tema.
 * A festa começa quando a cena aparece na tela, não quando ela é montada.
 */
export function TemaConcluido({ tema, total, onRever }: Props) {
	const cenaRef = useRef<HTMLElement>(null);
	const [ativa, setAtiva] = useState(false);

	useEffect(() => {
		const cena = cenaRef.current;
		if (!cena || typeof IntersectionObserver === 'undefined') {
			setAtiva(true);
			return;
		}
		const olho = new IntersectionObserver(
			([entrada]) => {
				if (!entrada.isIntersecting) return;
				setAtiva(true);
				olho.disconnect();
			},
			{ threshold: 0.6 },
		);
		olho.observe(cena);
		return () => olho.disconnect();
	}, []);

	return (
		<section
			ref={cenaRef}
			className={`cena cena--fim cena--concluida${ativa ? ' cena--ativa' : ''}`}
			style={corDoTema(tema)}
			aria-labelledby="fim-titulo"
		>
			<div className="concluida__cor" aria-hidden="true" />
			{ativa && (
				<div className="concluida__penas">
					<Penas />
				</div>
			)}
			<div className="aviso concluida__conteudo">
				<Curio humor="comemorando" tamanho={112} />
				<p className="concluida__selo">
					<IconeCerto tamanho={16} />
					{TEMAS[tema]} concluído
				</p>
				<h2 id="fim-titulo" className="fim__titulo concluida__titulo" tabIndex={-1}>
					Você descobriu tudo de {TEMAS[tema]}!
				</h2>
				<p className="concluida__texto">
					Foram {total} {total === 1 ? 'pergunta' : 'perguntas'}. O Curió cantou de orgulho.
				</p>
				<div className="concluida__acoes">
					<a className="proxima" href={rotaDosTemas()}>
						Escolher outro tema
						<IconeSetaDireita />
					</a>
					<button type="button" className="pular" onClick={onRever}>
						<IconeRecomecar tamanho={18} />
						Rever as perguntas
					</button>
				</div>
			</div>
		</section>
	);
}
