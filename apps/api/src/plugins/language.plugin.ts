import fp from 'fastify-plugin';
import i18next from './i18n.plugin.ts';
import { LANGUAGE, ACCEPT_LANGUAGE_HEADER } from '../common/constants/index.ts';

export default fp(async (fastify) => {
  fastify.decorateRequest('t', i18next.getFixedT(LANGUAGE.EN));

  fastify.addHook('onRequest', async (request) => {
    const queryLang = (request.query as { lang?: string })?.lang;

    const userLang = request.user?.language;

    const headerLang = request.headers[ACCEPT_LANGUAGE_HEADER] as string | undefined;

    const lang = queryLang ?? userLang ?? headerLang ?? LANGUAGE.EN;

    request.t = i18next.getFixedT(lang);
  });
});
