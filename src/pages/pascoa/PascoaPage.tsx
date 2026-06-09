import { useEffect } from 'react';
import { PascoaHeader } from '../../components/pascoa/PascoaHeader';
import { PascoaHero } from '../../components/pascoa/PascoaHero';
import { PascoaSobre } from '../../components/pascoa/PascoaSobre';
import { PascoaTenebras } from '../../components/pascoa/PascoaTenebras';
import { PascoaRessurreicao } from '../../components/pascoa/PascoaRessurreicao';
import { PascoaProgramacao } from '../../components/pascoa/PascoaProgramacao';
import { PascoaLocalizacao } from '../../components/pascoa/PascoaLocalizacao';
import { PascoaFAQ } from '../../components/pascoa/PascoaFAQ';
import { PascoaFooter } from '../../components/pascoa/PascoaFooter';

export default function PascoaPage() {
    useEffect(() => {
        const prevTitle = document.title;
        const metaTags = [
            { name: 'description', content: 'Caminhe conosco pelas sombras da cruz até a luz da manhã de domingo. Cerimônia Tenebras e Culto da Ressurreição na Igreja Batista Olaria.' },
            { property: 'og:title', content: 'Semana da Paixão e Ressurreição 2026 — Igreja Batista Olaria' },
            { property: 'og:description', content: 'Caminhe conosco pelas sombras da cruz até a luz da manhã de domingo. Cerimônia Tenebras e Culto da Ressurreição.' },
            { property: 'og:image', content: 'https://ibopvh.com.br/images/tenebras.png' },
            { property: 'og:url', content: 'https://ibopvh.com.br/pascoa' },
            { property: 'og:type', content: 'website' }
        ];

        document.title = 'Semana da Paixão e Ressurreição 2026 — Igreja Batista Olaria';

        // Add meta tags
        const addedTags: HTMLMetaElement[] = [];
        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            Object.entries(tag).forEach(([key, value]) => {
                meta.setAttribute(key, value);
            });
            document.head.appendChild(meta);
            addedTags.push(meta);
        });

        return () => {
            document.title = prevTitle;
            // Cleanup meta tags
            addedTags.forEach(tag => {
                if (document.head.contains(tag)) {
                    document.head.removeChild(tag);
                }
            });
        };
    }, []);

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
            <PascoaHeader />
            <PascoaHero />
            <PascoaSobre />
            <PascoaTenebras />
            <PascoaRessurreicao />
            <PascoaProgramacao />
            <PascoaLocalizacao />
            <PascoaFAQ />
            <PascoaFooter />
        </div>
    );
}
