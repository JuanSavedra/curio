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

export function registrarDia(): number {
	const hoje = diaLocal(new Date());
	const s = ler<Sequencia | null>(CHAVE_SEQUENCIA, null);
	if (s?.ultimoDia === hoje) return s.dias;
	const dias = lerSequencia() + 1;
	gravar(CHAVE_SEQUENCIA, { dias, ultimoDia: hoje });
	return dias;
}
