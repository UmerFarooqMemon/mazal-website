import { google } from "googleapis";
import type { WaitlistFields } from "@/lib/waitlist";

function getSheetsConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY.",
    );
  }

  return { spreadsheetId, clientEmail, privateKey };
}

function getSheetsClient() {
  const { clientEmail, privateKey } = getSheetsConfig();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function getTargetSheetName(spreadsheetId: string) {
  const configuredTab = process.env.GOOGLE_SHEETS_TAB?.trim();
  if (configuredTab) return configuredTab;

  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";
}

function formatPhoneForSheet(phone: string) {
  return phone.trim().replace(/^\+/, "");
}

export async function appendWaitlistEntry(
  data: WaitlistFields,
  source = "coming-soon",
) {
  const { spreadsheetId } = getSheetsConfig();
  const sheets = getSheetsClient();
  const sheetName = await getTargetSheetName(spreadsheetId);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          data.fullName.trim(),
          data.email.trim(),
          formatPhoneForSheet(data.phone),
          source,
        ],
      ],
    },
  });
}
