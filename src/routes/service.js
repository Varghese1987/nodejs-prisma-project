import prisma from "../db.js";
import { promiseWrapper } from "./utils.js";

export const identifyUser = async (body) => {
  const { email, phoneNumber } = body || {};

  const [err, contacts] = await findContactsByEmailOrPhoneNumber({
    email,
    phoneNumber,
  });
  if (err)
    return { status: 500, data: { message: err.message || "Server error" } };

  if (!contacts.length) return createUserAndSendResponse(body);

  return sendFinalResponse(contacts, body);
};

const sendFinalResponse = async (contactList, input) => {
  const { email, phoneNumber } = input || {};

  const emailUser = contactList.find((list) => list.email === email);

  const phoneUser = contactList.find(
    (list) => list.phoneNumber === phoneNumber
  );

  if (!emailUser || !phoneUser) {
    await createContact({ email, phoneNumber, linkPrecedence: "secondary" });
  }

  const [err, freshList] = await findContactsByEmailOrPhoneNumber({
    email,
    phoneNumber,
  });

  if (err)
    return { status: 500, data: { message: err.message || "Server error" } };

  const contacts = freshList.reduce(
    (acc, item) => {
      const { linkPrecedence, id, email, phoneNumber } = item || {};
      if (linkPrecedence === "primary") {
        acc.primaryContatctId = id;
      } else {
        acc.secondaryContactIds.push(id);
      }
      if (!acc.emails.includes(email)) acc.emails.push(email);
      if (!acc.phoneNumbers.includes(phoneNumber))
        acc.phoneNumbers.push(phoneNumber);

      return acc;
    },
    {
      primaryContatctId: 0,
      emails: [],
      phoneNumbers: [],
      secondaryContactIds: [],
    }
  );
  return { status: 200, data: { contacts } };
};

const createContact = ({ email, phoneNumber, linkPrecedence }) => {
  const request = prisma.contact.create({
    data: {
      phoneNumber,
      email,
      linkPrecedence,
    },
  });

  return promiseWrapper(request);
};

const createUserAndSendResponse = async ({ email, phoneNumber }) => {
  const { err, res } = await createContact({
    email,
    phoneNumber,
    linkPrecedence: "primary",
  });

  if (err)
    return { status: 500, data: { message: err.message || "Server error" } };

  const response = {
    contacts: {
      primaryContatctId: res.id,
      emails: [res.email],
      phoneNumbers: [res.phoneNumber],
      secondaryContactIds: [],
    },
  };

  return { status: 200, data: response };
};

const findContactsByEmailOrPhoneNumber = async ({ email, phoneNumber }) => {
  const request = prisma.contact.findMany({
    where: {
      OR: [{ email: email }, { phoneNumber: phoneNumber }],
    },
  });

  const { err, res } = await promiseWrapper(request);

  return [err, res];
};
