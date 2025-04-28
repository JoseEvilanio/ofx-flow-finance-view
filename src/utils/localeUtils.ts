
export const getDefaultLocale = (): string => {
  return navigator.language || 
         navigator.languages?.[0] || 
         'pt-BR'; // Fallback para português do Brasil
};

export const getDefaultLanguage = (): string => {
  return getDefaultLocale().split('-')[0]; // Retorna apenas a parte do idioma (ex: 'pt' de 'pt-BR')
};
