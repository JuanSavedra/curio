import type { ResumoDeck } from '../../lib/tipos';

// Progresso local. Se o localStorage estiver bloqueado, tudo funciona, só não fica guardado.
const CHAVE_VISTAS = 'curio:vistas';
const CHAVE_SEQUENCIA = 'curio:sequencia';
const CHAVE_VISITOU = 'curio:visitou';

function ler<T>(chave: string, padrao: T): T {
	try {
		const bruto = localStorage.getItem(chave);
		return bruto === null ? padrao : (JSON.parse(bruto) as T);
	} catch {
		return padrao;
	}
}

function gravar(chave: string, valor: unknown) {
	try {
		localStorage.setItem(chave, JSON.stringify(valor));
	} catch {
		// Sem armazenamento disponível: segue sem guardar.
	}
}

export const lerVistas = () => new Set(ler<string[]>(CHAVE_VISTAS, []));

export function marcarVista(id: string) {
	const vistas = lerVistas();
	vistas.add(id);
	gravar(CHAVE_VISTAS, [...vistas]);
}

export function esquecerVistas(prefixos: string[]) {
	const restantes = [...lerVistas()].filter((id) => !prefixos.some((p) => id.startsWith(p)));
	gravar(CHAVE_VISTAS, restantes);
}

/** Quantas perguntas do deck já foram vistas (descobertas), nunca mais que o total. */
export function descobertasDoDeck(vistas: Set<string>, deck: string, total: number) {
	let n = 0;
	for (const id of vistas) if (id.startsWith(`${deck}/`)) n++;
	return Math.min(n, total);
}

export interface ProgressoDosDecks {
	total: number;
	descobertas: number;
	concluido: boolean;
}

/** Soma o progresso de um conjunto de decks (um tema inteiro, por exemplo). */
export function progressoDosDecks(vistas: Set<string>, decks: ResumoDeck[]): ProgressoDosDecks {
	const total = decks.reduce((soma, d) => soma + d.total, 0);
	const descobertas = decks.reduce((soma, d) => soma + descobertasDoDeck(vistas, d.id, d.total), 0);
	return { total, descobertas, concluido: total > 0 && descobertas >= total };
}

const CHAVE_ULTIMO_TEMA = 'curio:ultimo-tema';
export const lerUltimoTema = () => ler<string | null>(CHAVE_ULTIMO_TEMA, null);
export const gravarUltimoTema = (tema: string) => gravar(CHAVE_ULTIMO_TEMA, tema);

export const jaVisitou = () => ler(CHAVE_VISITOU, false);
export const marcarVisita = () => gravar(CHAVE_VISITOU, true);

interface Sequencia {
	dias: number;
	ultimoDia: string;
}

const diaLocal = (data: Date) =>
	`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

/** Dias seguidos com pelo menos uma resposta. Quebrar a sequência só recomeça, sem culpa. */
export function lerSequencia(): number {
	const s = ler<Sequencia | null>(CHAVE_SEQUENCIA, null);
	if (!s) return 0;
	const ontem = new Date();
	ontem.setDate(ontem.getDate() - 1);
	return s.ultimoDia === diaLocal(new Date()) || s.ultimoDia === diaLocal(ontem) ? s.dias : 0;
}

/** Registra a resposta de hoje. `novoDia` diz se foi a primeira do dia (quando um marco pode ser completado). */
export function registrarDia(): { dias: number; novoDia: boolean } {
	const hoje = diaLocal(new Date());
	const s = ler<Sequencia | null>(CHAVE_SEQUENCIA, null);
	if (s?.ultimoDia === hoje) return { dias: s.dias, novoDia: false };
	const dias = lerSequencia() + 1;
	gravar(CHAVE_SEQUENCIA, { dias, ultimoDia: hoje });
	return { dias, novoDia: true };
}
