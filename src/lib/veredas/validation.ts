import {
  CuradoriaTipoItem,
  CuradoriaNivel,
  CuradoriaStatus,
  CuradoriaDisponibilidade,
  CuradoriaTipoAcesso,
  CuradoriaFormatoAcesso,
  CuradoriaProvedorAcesso,
  CuradoriaMotivoRelato,
  CuradoriaPapelPessoa,
} from '@prisma/client';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

export function validateReportPayload(payload: any): ValidationResult<{
  acessoId: number;
  motivo: CuradoriaMotivoRelato;
  observacao?: string;
  honeypot?: string;
}> {
  const errors: string[] = [];

  if (payload.honeypot) {
    errors.push('Submissão inválida detectada');
  }

  const acessoId = Number(payload.acessoId);
  if (isNaN(acessoId) || acessoId <= 0) {
    errors.push('ID de acesso inválido');
  }

  const motivosValidos = Object.values(CuradoriaMotivoRelato);
  if (!payload.motivo || !motivosValidos.includes(payload.motivo)) {
    errors.push('Motivo do relato inválido ou não informado');
  }

  let observacao: string | undefined = undefined;
  if (payload.observacao) {
    if (typeof payload.observacao !== 'string') {
      errors.push('Observação deve ser texto');
    } else if (payload.observacao.trim().length > 500) {
      errors.push('Observação não pode exceder 500 caracteres');
    } else {
      observacao = payload.observacao.trim();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { acessoId, motivo: payload.motivo, observacao } : undefined,
  };
}

export function validateItemPayload(payload: any): ValidationResult<any> {
  const errors: string[] = [];

  if (!payload.titulo || typeof payload.titulo !== 'string' || payload.titulo.trim().length < 2) {
    errors.push('Título é obrigatório (mínimo 2 caracteres)');
  }

  if (!payload.resumo || typeof payload.resumo !== 'string' || payload.resumo.trim().length < 5) {
    errors.push('Resumo é obrigatório (mínimo 5 caracteres)');
  }

  if (!payload.porqueIndicamos || typeof payload.porqueIndicamos !== 'string' || payload.porqueIndicamos.trim().length < 10) {
    errors.push('Campo "Por que indicamos?" é obrigatório (mínimo 10 caracteres)');
  }

  const niveisValidos = Object.values(CuradoriaNivel);
  if (!payload.nivel || !niveisValidos.includes(payload.nivel)) {
    errors.push('Nível é inválido ou não foi informado');
  }

  const tiposValidos = Object.values(CuradoriaTipoItem);
  if (!payload.tipo || !tiposValidos.includes(payload.tipo)) {
    errors.push('Tipo de item (VÍDEO, LIVRO ou CURSO) é inválido');
  }

  const statusValidos = Object.values(CuradoriaStatus);
  if (payload.tipo === CuradoriaTipoItem.LIVRO) {
    const bookValidation = validateBookPayload(payload.livro || {});
    errors.push(...bookValidation.errors);

    const acessos = payload.livro?.acessos || [];
    if (!Array.isArray(acessos)) {
      errors.push('A lista de links de acesso deve ser valida');
    } else {
      acessos.forEach((acesso: any, index: number) => {
        const accessValidation = validateAccessPayload(acesso);
        errors.push(...accessValidation.errors.map((error) => `Link ${index + 1}: ${error}`));
      });
    }
  }

  if (payload.tipo === CuradoriaTipoItem.VIDEO) {
    const videoValidation = validateVideoPayload(payload.video || {});
    errors.push(...videoValidation.errors);
  }

  if (payload.tipo === CuradoriaTipoItem.CURSO) {
    const courseValidation = validateCoursePayload(payload.curso || {});
    errors.push(...courseValidation.errors);
  }

  if (payload.status && !statusValidos.includes(payload.status)) {
    errors.push('Status informado é inválido');
  }

  if (!Array.isArray(payload.categoriaIds) || payload.categoriaIds.length === 0) {
    errors.push('Todo item deve ter ao menos uma categoria selecionada');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: payload,
  };
}

export function validateCoursePayload(payload: any): ValidationResult<any> {
  const errors: string[] = [];
  if (!payload.urlOriginal || typeof payload.urlOriginal !== 'string' || !payload.urlOriginal.startsWith('http')) {
    errors.push('URL original da playlist é obrigatória e deve ser válida');
  }
  if (!payload.playlistId || typeof payload.playlistId !== 'string') {
    errors.push('ID da playlist é obrigatório');
  }
  if (!Array.isArray(payload.aulas) || payload.aulas.length === 0) {
    errors.push('O curso deve possuir ao menos uma aula');
  } else {
    const ids = new Set<string>();
    payload.aulas.forEach((aula: any, index: number) => {
      if (!aula.titulo || typeof aula.titulo !== 'string' || aula.titulo.trim().length < 2) {
        errors.push(`Aula ${index + 1}: informe o título`);
      }
      if (!aula.youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(aula.youtubeId)) {
        errors.push(`Aula ${index + 1}: vídeo do YouTube inválido`);
      }
      if (ids.has(aula.youtubeId)) errors.push(`Aula ${index + 1}: vídeo duplicado`);
      ids.add(aula.youtubeId);
    });
  }
  if (payload.materiais !== undefined && !Array.isArray(payload.materiais)) {
    errors.push('A lista de materiais é inválida');
  } else {
    (payload.materiais || []).forEach((material: any, index: number) => {
      if (!material.titulo || material.titulo.trim().length < 2) errors.push(`Material ${index + 1}: informe o nome`);
      try {
        const url = new URL(material.url);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
      } catch { errors.push(`Material ${index + 1}: informe um link válido`); }
    });
  }
  return { isValid: errors.length === 0, errors, data: errors.length === 0 ? payload : undefined };
}

export function validateBookPayload(payload: any): ValidationResult<any> {
  const errors: string[] = [];

  if (payload.disponibilidade && !Object.values(CuradoriaDisponibilidade).includes(payload.disponibilidade)) {
    errors.push('Disponibilidade informada é inválida');
  }

  if (payload.anoPublicacao) {
    const ano = Number(payload.anoPublicacao);
    if (isNaN(ano) || ano < 1000 || ano > new Date().getFullYear() + 1) {
      errors.push('Ano de publicação inválido');
    }
  }

  if (payload.numeroPaginas) {
    const paginas = Number(payload.numeroPaginas);
    if (isNaN(paginas) || paginas <= 0) {
      errors.push('Número de páginas deve ser um inteiro positivo');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: payload,
  };
}

export function validateVideoPayload(payload: any): ValidationResult<any> {
  const errors: string[] = [];

  if (!payload.urlOriginal || typeof payload.urlOriginal !== 'string' || !payload.urlOriginal.startsWith('http')) {
    errors.push('URL original do vídeo é obrigatória e deve ser válida (HTTP/HTTPS)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: payload,
  };
}

export function validateAccessPayload(payload: any): ValidationResult<any> {
  const errors: string[] = [];

  if (!payload.url || typeof payload.url !== 'string' || !payload.url.startsWith('http')) {
    errors.push('URL de acesso é obrigatória e deve ser válida (HTTP/HTTPS)');
  }

  if (!payload.textoBotao || typeof payload.textoBotao !== 'string' || payload.textoBotao.trim().length === 0) {
    errors.push('Texto do botão de acesso é obrigatório');
  }

  if (!payload.tipo || !Object.values(CuradoriaTipoAcesso).includes(payload.tipo)) {
    errors.push('Tipo de acesso é obrigatório e inválido');
  }

  if (!payload.provedor || !Object.values(CuradoriaProvedorAcesso).includes(payload.provedor)) {
    errors.push('Provedor de acesso é obrigatório e inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: payload,
  };
}
