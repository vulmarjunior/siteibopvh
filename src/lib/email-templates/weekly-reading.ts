interface LeituraDiaria {
  dia: string;
  texto: string;
  descricao: string;
}

interface WeeklyReadingEmailProps {
  sermoeNumero: string;
  sermoeTitulo: string;
  tema: string;
  dias: LeituraDiaria[];
  unsubscribeUrl: string;
  siteUrl: string;
}

export function buildWeeklyReadingEmail({
  sermoeNumero,
  sermoeTitulo,
  tema,
  dias,
  unsubscribeUrl,
  siteUrl,
}: WeeklyReadingEmailProps): string {
  const diasHtml = dias
    .map(
      (d) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #2a2d35;font-weight:600;color:#d4af37;width:100px;vertical-align:top;">${d.dia}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #2a2d35;">
          <div style="color:#e5e7eb;font-size:15px;margin-bottom:4px;">${d.texto}</div>
          <div style="color:#9ca3af;font-size:13px;">${d.descricao}</div>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0f1115;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1115;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1d24;border-radius:12px;overflow:hidden;border:1px solid #2a2d35;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #2a2d35;">
              <img src="${siteUrl}/images/logo.png" alt="IBO" height="48" style="filter:brightness(0) invert(1);opacity:0.9;" />
              <h1 style="color:#d4af37;font-size:22px;margin:16px 0 4px;font-family:Georgia,serif;">Leitura da Semana</h1>
              <p style="color:#9ca3af;font-size:14px;margin:0;">Série Da Ascensão à Parousia</p>
            </td>
          </tr>

          <!-- Sermon Reference -->
          <tr>
            <td style="padding:24px 32px;">
              <div style="background-color:#0f1115;border-radius:8px;padding:20px;border:1px solid #2a2d35;">
                <div style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Sermão #${sermoeNumero}</div>
                <div style="color:#ffffff;font-size:18px;font-family:Georgia,serif;margin-bottom:8px;">${sermoeTitulo}</div>
                <div style="color:#d4af37;font-size:14px;font-style:italic;">"${tema}"</div>
              </div>
            </td>
          </tr>

          <!-- Readings Table -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #2a2d35;">
                <tr>
                  <td style="padding:12px 16px;background-color:#0f1115;border-bottom:1px solid #2a2d35;">
                    <span style="color:#d4af37;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Leituras de Segunda a Sábado</span>
                  </td>
                </tr>
                ${diasHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${siteUrl}/da-ascensao-a-parousia" style="display:inline-block;padding:14px 32px;background-color:#d4af37;color:#0f1115;text-decoration:none;font-weight:600;border-radius:6px;font-size:15px;">Ver hotsite da série</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2a2d35;text-align:center;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">
                Igreja Batista Olaria — Porto Velho, RO
              </p>
              <p style="color:#4b5563;font-size:11px;margin:0;">
                <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
