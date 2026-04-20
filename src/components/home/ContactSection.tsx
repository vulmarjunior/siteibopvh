import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, CheckCircle, X, Loader2 } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://formsubmit.co/ajax/contato@ibopvh.com.br", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        // Reset form
        (e.target as HTMLFormElement).reset();

        // Auto-hide after 8 seconds
        const timer = setTimeout(() => setShowSuccess(false), 8000);
        // The return of clearTimeout is for cleanup if the component unmounts,
        // but in this context, it's not strictly necessary as the timer
        // is tied to a local state and not a global effect.
        // For consistency with useEffect, we can keep it.
        return () => clearTimeout(timer);
      } else {
        alert("Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="py-24 bg-olaria-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">Fale Conosco</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">Estamos aqui para servir</h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Info Side */}
          <div className="md:col-span-2 bg-stone-850 p-8 md:p-12 rounded-2xl text-white flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-8 text-olaria">Informações de Contato</h3>
              <ul className="space-y-6">
                {/* 
                   LINK: Google Maps
                   - Usar Short Link (goo.gl) ou Link completo.
                   - Sempre target="_blank".
                */}
                <li className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-olaria shrink-0 mt-1" />
                  <div>
                    <strong className="block text-lg mb-1">Endereço</strong>
                    <a
                      href="https://maps.app.goo.gl/GbUQXWGH1AnqBzfL7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-300 hover:text-olaria transition-colors"
                    >
                      R. Júlio de Castilho, 1368<br />Olaria, Porto Velho - RO
                    </a>
                  </div>
                </li>
                {/* 
                   LINK: WhatsApp API
                   - Formato internacional: wa.me/55DDNNNNNNNNN (apenas números).
                */}
                <li className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-olaria shrink-0 mt-1" />
                  <div>
                    <strong className="block text-lg mb-1">WhatsApp</strong>
                    <a
                      href="https://wa.me/5569993852595"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-300 hover:text-olaria transition-colors"
                    >
                      (69) 99385-2595
                    </a>
                  </div>
                </li>
                {/* 
                   LINK: Mailto
                   - Verificar se o email de destino é válido e monitorado.
                */}
                <li className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-olaria shrink-0 mt-1" />
                  <div>
                    <strong className="block text-lg mb-1">Email</strong>
                    <a href="mailto:contato@ibopvh.com.br" className="text-stone-300 hover:text-olaria transition-colors">
                      contato@ibopvh.com.br
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-12 md:mt-0">
              {/* Pastoral hours message removed as requested */}
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-3 bg-white p-8 md:p-12 rounded-2xl shadow-sm">
            {/* 
               FORM ACTION: FormSubmit.co
               - Endpoint gratuito. Para produção de alto volume, considerar backend próprio.
               - O email na URL deve ser confirmado no primeiro envio.
            */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* FormSubmit Configuration */}
              <input type="hidden" name="_subject" value="Novo contato via Site IBO" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />

              {showSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <p className="font-medium">Mensagem enviada com sucesso! Em breve entraremos em contato.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSuccess(false)}
                    className="text-emerald-500 hover:text-emerald-700 transition-colors"
                    aria-label="Fechar mensagem de sucesso"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-stone-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olaria/20 focus:border-olaria transition-all disabled:opacity-50"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-2">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olaria/20 focus:border-olaria transition-all disabled:opacity-50"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-stone-700 mb-2">Assunto</label>
                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olaria/20 focus:border-olaria transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option>Informações sobre a igreja</option>
                    <option>Pedido de Oração</option>
                    <option>Outros assuntos</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-2">Mensagem</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olaria/20 focus:border-olaria transition-all resize-none disabled:opacity-50"
                  placeholder="Como podemos ajudar?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-850 hover:bg-stone-700 disabled:bg-stone-500 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Mensagem
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;