import express from "express";
import { readFile, writeFile } from "node:fs/promises";

const STATUSES = ["open", "in_progress", "closed"] as const;

type Status = (typeof STATUSES)[number];

type Inquiry = {
  id: number;
  subject: string;
  body: string;
  customerName: string;
  status: Status;
  createdAt: string;
};

const DATA_FILE = "data/inquiries.json";

const readInquiries = async (): Promise<Inquiry[]> => {
  return JSON.parse(await readFile(DATA_FILE, "utf-8"));
};

const writeInquiries = async (inquiries: Inquiry[]): Promise<void> => {
  await writeFile(DATA_FILE, JSON.stringify(inquiries, null, 2) + "\n");
};

const app = express();
app.use(express.json());

app.get("/inquiries", async (req, res) => {
  const { status } = req.query;
  const inquiries = await readInquiries();

  const result = inquiries
    .filter((inquiry) => !status || inquiry.status === status)
    .map((inquiry) => ({
      id: inquiry.id,
      subject: inquiry.subject,
      customerName: inquiry.customerName,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    }));

  res.json(result);
});

app.get("/inquiries/:id", async (req, res) => {
  const id = Number(req.params.id);
  const inquiries = await readInquiries();
  const inquiry = inquiries.find((inquiry) => inquiry.id === id);

  if (!inquiry) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }

  res.json(inquiry);
});

app.patch("/inquiries/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    return;
  }

  const inquiries = await readInquiries();
  const inquiry = inquiries.find((inquiry) => inquiry.id === id);

  if (!inquiry) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }

  inquiry.status = status;
  await writeInquiries(inquiries);

  res.json(inquiry);
});

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Inquiry API listening on http://localhost:${PORT}`);
});
