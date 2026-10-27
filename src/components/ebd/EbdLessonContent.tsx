import type { EbdDailyReading, EbdQuestion, EbdSection } from '../../types/ebd';

interface EbdLessonContentProps {
  introduction: string[];
  sections: EbdSection[];
  questions: EbdQuestion[];
  dailyReadings: EbdDailyReading[];
  sectionIdPrefix?: string;
}

export function EbdLessonContent({
  introduction,
  sections,
  questions,
  dailyReadings,
  sectionIdPrefix = 'secao',
}: EbdLessonContentProps) {
  return (
    <>
      <div className="ebd-intro ebd-prose-width">
        {introduction.map((paragraph, index) => (
          <p key={`intro-${index}`}>{paragraph}</p>
        ))}
      </div>

      {sections.map((section) => {
        const sectionId = `${sectionIdPrefix}-${section.number}`;
        return (
          <section key={section.number} aria-labelledby={sectionId}>
            <h2 id={sectionId}>
              {section.number}. {section.title}
            </h2>
            <div className="ebd-prose-width">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.number}-${index}`}>{paragraph}</p>
              ))}
              {section.references && section.references.length > 0 ? (
                <p className="text-sm ebd-muted">
                  <strong>Referências:</strong> {section.references.join('; ')}
                </p>
              ) : null}
            </div>
          </section>
        );
      })}

      {questions.length > 0 ? (
        <section aria-labelledby={`${sectionIdPrefix}-para-pensar`}>
          <h2 id={`${sectionIdPrefix}-para-pensar`}>Para pensar e agir</h2>
          <ol className="ebd-questions ebd-prose-width">
            {questions.map((question) => (
              <li key={question.number}>{question.text}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {dailyReadings.length > 0 ? (
        <section aria-labelledby={`${sectionIdPrefix}-leitura-diaria`}>
          <h2 id={`${sectionIdPrefix}-leitura-diaria`}>Leitura diária</h2>
          <ul className="ebd-readings ebd-prose-width">
            {dailyReadings.map((reading) => (
              <li key={`${reading.day}-${reading.reference}`}>
                <span className="ebd-day">{reading.day}</span>
                <span>{reading.reference}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
