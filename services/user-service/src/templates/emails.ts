import dayjs from "dayjs";

const BRAND_COLOR = "#8A5A2B";
const TEXT_COLOR = "#1a1a1a";
const MUTED_COLOR = "#52525b";
const BORDER_COLOR = "#e4e4e7";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f4f4f5";

interface LayoutOptions {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

function layout({ preheader, heading, bodyHtml, ctaLabel, ctaUrl }: LayoutOptions) {
  const cta =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td style="padding: 8px 40px 4px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-radius: 8px; background-color: ${BRAND_COLOR};">
                  <a
                    href="${ctaUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="display: inline-block; padding: 12px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;"
                  >${ctaLabel}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 40px 0; font-size: 13px; color: ${MUTED_COLOR}; word-break: break-all;">
            Or copy this link into your browser: <a href="${ctaUrl}" style="color: ${BRAND_COLOR};">${ctaUrl}</a>
          </td>
        </tr>
      `
      : "";

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${heading} · Dipak Studio</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${PAGE_BG};">
    <span style="display: none; visibility: hidden; opacity: 0; overflow: hidden; height: 0; width: 0; max-height: 0; max-width: 0; mso-hide: all;">
      ${preheader}
    </span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${PAGE_BG};">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="max-width: 560px; background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; overflow: hidden;"
          >
            <tr>
              <td style="padding: 28px 40px 12px;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; font-style: italic; color: ${BRAND_COLOR}; letter-spacing: -0.01em;">Dipak Studio</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 40px 0;">
                <h1 style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; line-height: 1.3; color: ${TEXT_COLOR};">
                  ${heading}
                </h1>
              </td>
            </tr>
            <tr>
              <td
                style="padding: 0 40px 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: ${TEXT_COLOR};"
              >
                ${bodyHtml}
              </td>
            </tr>
            ${cta}
            <tr>
              <td style="padding: 28px 40px 0;">
                <hr style="border: none; border-top: 1px solid ${BORDER_COLOR}; margin: 0;" />
              </td>
            </tr>
            <tr>
              <td
                style="padding: 16px 40px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: ${MUTED_COLOR};"
              >
                You're receiving this email because of activity on your Dipak Studio account.
                <a href="${process.env.CLIENT_URL}/settings" style="color: ${MUTED_COLOR}; text-decoration: underline;">Manage email preferences</a>
                to control which notifications you get.
                <br />
                © ${dayjs().year()} Dipak Studio. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function passwordChangedEmail(name: string) {
  return {
    subject: "Your Dipak Studio password was changed",
    html: layout({
      preheader: "Your password was just changed. Wasn't you? Secure your account now.",
      heading: "Your password was changed",
      bodyHtml: `
        <p style="margin: 0 0 16px;">Hi ${name}, this is a confirmation that the password for your Dipak Studio account was just changed.</p>
        <p style="margin: 0;"><strong>If this wasn't you</strong>, your account may be at risk — reset your password immediately and review your recent activity.</p>
      `,
      ctaLabel: "Secure your account",
      ctaUrl: `${process.env.CLIENT_URL}/forgot-password`,
    }),
  };
}

export function newSubscriberEmail(channelName: string, subscriberName: string) {
  return {
    subject: "You have a new follower!",
    html: layout({
      preheader: `${subscriberName} just followed your Dipak Studio channel.`,
      heading: "You have a new follower! 🎉",
      bodyHtml: `
        <p style="margin: 0 0 16px;">Hi ${channelName}, great news — <strong>${subscriberName}</strong> just followed your channel.</p>
        <p style="margin: 0;">Keep the momentum going by checking your channel stats and posting your next video.</p>
      `,
      ctaLabel: "View your dashboard",
      ctaUrl: `${process.env.CLIENT_URL}/dashboard`,
    }),
  };
}
