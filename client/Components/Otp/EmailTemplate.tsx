interface EmailTemplateProps {
  /** Recipient's name; falls back to a generic greeting when omitted. */
  firstName?: string;
  /** The one-time passcode to display. */
  otp: string;
}

// Email-safe palette (light theme, brand orange).
const COLORS = {
  primary: "#FF6500",
  primarySoft: "#FFF1E7",
  text: "#0C0C0C",
  muted: "#6B7280",
  faint: "#9AA6B6",
  border: "#E7EBF1",
  pageBg: "#F4F6FA",
  cardBg: "#FFFFFF",
};

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Light-themed, email-client-safe OTP / password-reset email.
 * Uses table layout + inline styles for Gmail/Outlook compatibility.
 */
export function EmailTemplate({ firstName, otp }: EmailTemplateProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        backgroundColor: COLORS.pageBg,
        margin: 0,
        padding: "32px 0",
        fontFamily: FONT_STACK,
        width: "100%",
      }}
    >
      <tbody>
        <tr>
          <td align="center" style={{ padding: "0 16px" }}>
            {/* Card */}
            <table
              role="presentation"
              width="480"
              cellPadding={0}
              cellSpacing={0}
              style={{
                width: "480px",
                maxWidth: "100%",
                backgroundColor: COLORS.cardBg,
                borderRadius: "16px",
                border: `1px solid ${COLORS.border}`,
                overflow: "hidden",
              }}
            >
              <tbody>
                {/* Brand header */}
                <tr>
                  <td style={{ padding: "28px 36px 0 36px" }}>
                    <table role="presentation" cellPadding={0} cellSpacing={0}>
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: "middle" }}>
                            <span
                              style={{
                                display: "inline-block",
                                width: "28px",
                                height: "28px",
                                lineHeight: "28px",
                                textAlign: "center",
                                borderRadius: "8px",
                                backgroundColor: COLORS.primary,
                                color: "#FFFFFF",
                                fontWeight: 700,
                                fontSize: "16px",
                              }}
                            >
                              P
                            </span>
                          </td>
                          <td style={{ verticalAlign: "middle", paddingLeft: "10px" }}>
                            <span
                              style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: COLORS.text,
                                letterSpacing: "-0.2px",
                              }}
                            >
                              ProfilizePro
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: "24px 36px 8px 36px" }}>
                    <h1
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: COLORS.text,
                      }}
                    >
                      Reset your password
                    </h1>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: "22px",
                        color: COLORS.muted,
                      }}
                    >
                      Hi {firstName || "there"}, we received a request to reset your
                      password. Enter the verification code below to continue.
                    </p>
                  </td>
                </tr>

                {/* OTP code */}
                <tr>
                  <td style={{ padding: "20px 36px" }}>
                    <table
                      role="presentation"
                      width="100%"
                      cellPadding={0}
                      cellSpacing={0}
                      style={{
                        backgroundColor: COLORS.primarySoft,
                        borderRadius: "12px",
                        border: `1px solid ${COLORS.primary}33`,
                      }}
                    >
                      <tbody>
                        <tr>
                          <td align="center" style={{ padding: "20px" }}>
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                letterSpacing: "1.5px",
                                textTransform: "uppercase",
                                color: COLORS.faint,
                                marginBottom: "8px",
                              }}
                            >
                              Verification Code
                            </div>
                            <div
                              style={{
                                fontSize: "34px",
                                fontWeight: 700,
                                letterSpacing: "10px",
                                color: COLORS.primary,
                                fontFamily: FONT_STACK,
                              }}
                            >
                              {otp}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Note */}
                <tr>
                  <td style={{ padding: "0 36px 28px 36px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: "20px",
                        color: COLORS.muted,
                      }}
                    >
                      This code expires shortly. If you didn&apos;t request a password
                      reset, you can safely ignore this email — your account remains
                      secure.
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      padding: "18px 36px",
                      borderTop: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: COLORS.faint,
                      }}
                    >
                      &copy; {new Date().getFullYear()} ProfilizePro. All rights
                      reserved.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default EmailTemplate;
