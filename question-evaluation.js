/* Doctor Core — contrato único de avaliação de respostas.
 * Compartilhado pelo runtime e pelos testes; sem dependências de UI.
 */
(function (root) {
  'use strict';
  function evaluate(question, selected) {
    if (!question || !Array.isArray(question.options) ||
        !Number.isInteger(question.correct) ||
        question.correct < 0 || question.correct >= question.options.length) {
      return { ok: false, reason: 'invalid-question' };
    }
    if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
      return { ok: false, reason: 'invalid-option' };
    }
    return {
      ok: true,
      selected: selected,
      correct: question.correct,
      isCorrect: selected === question.correct
    };
  }
  root.DoctorAnswerContract = Object.freeze({ version: '1.0.0', evaluate: evaluate });
})(typeof window !== 'undefined' ? window : globalThis);
