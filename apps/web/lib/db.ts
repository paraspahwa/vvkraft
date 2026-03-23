import { adminDb } from "./firebase-admin";
import type { User, Generation, Character, CreditTransaction, SubscriptionTier, VideoUpscaleJob } from "@videoforge/shared";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

// Collection helpers
const usersCol = () => adminDb.collection("users");
const generationsCol = () => adminDb.collection("generations");
const charactersCol = () => adminDb.collection("characters");
const transactionsCol = () => adminDb.collection("creditTransactions");
const upscaleJobsCol = () => adminDb.collection("videoUpscaleJobs");

function fromTimestamp(ts: Timestamp): Date {
  return ts.toDate();
}

type FirestoreDocData = Record<string, unknown> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processingStartedAt?: Timestamp;
  completedAt?: Timestamp;
};

function docToUser(data: FirestoreDocData, id: string): User {
  return {
    ...data,
    id,
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
  } as User;
}

function docToGeneration(data: FirestoreDocData, id: string): Generation {
  return {
    ...data,
    id,
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
    processingStartedAt: data.processingStartedAt ? fromTimestamp(data.processingStartedAt) : null,
    completedAt: data.completedAt ? fromTimestamp(data.completedAt) : null,
  } as Generation;
}

// ── User operations ──────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<User | null> {
  const doc = await usersCol().doc(userId).get();
  if (!doc.exists) return null;
  return docToUser(doc.data() as FirestoreDocData, doc.id);
}

export async function createUser(
  userId: string,
  data: Pick<User, "email" | "displayName" | "photoURL">
): Promise<User> {
  const now = Timestamp.now();
  const userData = {
    ...data,
    tier: "free" as SubscriptionTier,
    credits: 0,
    creditsUsedThisMonth: 0,
    razorpayCustomerId: null,
    razorpaySubscriptionId: null,
    createdAt: now,
    updatedAt: now,
  };
  await usersCol().doc(userId).set(userData);
  return docToUser(userData, userId);
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  await usersCol().doc(userId).update({
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deductCredits(
  userId: string,
  amount: number,
  generationId: string,
  description: string
): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const userRef = usersCol().doc(userId);
    const userDoc = await tx.get(userRef);
    if (!userDoc.exists) throw new Error("User not found");

    const user = userDoc.data() as User;
    if (user.credits < amount) throw new Error("Insufficient credits");

    const balanceAfter = user.credits - amount;

    tx.update(userRef, {
      credits: FieldValue.increment(-amount),
      creditsUsedThisMonth: FieldValue.increment(amount),
      updatedAt: Timestamp.now(),
    });

    const txRef = transactionsCol().doc();
    tx.set(txRef, {
      userId,
      amount: -amount,
      balanceAfter,
      type: "generation",
      description,
      generationId,
      razorpayPaymentId: null,
      createdAt: Timestamp.now(),
    });
  });
}

export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransaction["type"],
  description: string,
  razorpayPaymentId?: string
): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const userRef = usersCol().doc(userId);
    const userDoc = await tx.get(userRef);
    if (!userDoc.exists) throw new Error("User not found");

    const user = userDoc.data() as User;
    const balanceAfter = user.credits + amount;

    tx.update(userRef, {
      credits: FieldValue.increment(amount),
      updatedAt: Timestamp.now(),
    });

    const txRef = transactionsCol().doc();
    tx.set(txRef, {
      userId,
      amount,
      balanceAfter,
      type,
      description,
      generationId: null,
      razorpayPaymentId: razorpayPaymentId ?? null,
      createdAt: Timestamp.now(),
    });
  });
}

// ── Generation operations ────────────────────────────────────────────────────

export async function createGeneration(
  data: Omit<Generation, "id" | "createdAt" | "updatedAt">
): Promise<Generation> {
  const now = Timestamp.now();
  const ref = generationsCol().doc();
  const generation = { ...data, createdAt: now, updatedAt: now };
  await ref.set(generation);
  return {
    ...data,
    id: ref.id,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

export async function getGenerationById(generationId: string): Promise<Generation | null> {
  const doc = await generationsCol().doc(generationId).get();
  if (!doc.exists) return null;
  return docToGeneration(doc.data() as FirestoreDocData, doc.id);
}

export async function updateGeneration(
  generationId: string,
  data: Partial<Omit<Generation, "id" | "createdAt">>
): Promise<void> {
  await generationsCol().doc(generationId).update({
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function getUserGenerations(
  userId: string,
  limit = 20,
  startAfter?: string
): Promise<Generation[]> {
  let query = generationsCol()
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (startAfter) {
    const cursor = await generationsCol().doc(startAfter).get();
    query = query.startAfter(cursor);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => docToGeneration(doc.data() as FirestoreDocData, doc.id));
}

// ── Character operations ─────────────────────────────────────────────────────

export async function createCharacter(
  data: Omit<Character, "id" | "createdAt" | "updatedAt" | "generationCount">
): Promise<Character> {
  const now = Timestamp.now();
  const ref = charactersCol().doc();
  const character = { ...data, generationCount: 0, createdAt: now, updatedAt: now };
  await ref.set(character);
  return {
    ...character,
    id: ref.id,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

export async function getUserCharacters(userId: string): Promise<Character[]> {
  const snapshot = await charactersCol()
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: fromTimestamp(data["createdAt"]),
      updatedAt: fromTimestamp(data["updatedAt"]),
    } as Character;
  });
}

// ── Video Upscale Job operations ──────────────────────────────────────────────

function docToUpscaleJob(data: FirestoreDocData, id: string): VideoUpscaleJob {
  return {
    ...data,
    id,
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
    processingStartedAt: data.processingStartedAt ? fromTimestamp(data.processingStartedAt) : null,
    completedAt: data.completedAt ? fromTimestamp(data.completedAt) : null,
  } as VideoUpscaleJob;
}

export async function createUpscaleJob(
  data: Omit<VideoUpscaleJob, "id" | "createdAt" | "updatedAt">
): Promise<VideoUpscaleJob> {
  const now = Timestamp.now();
  const ref = upscaleJobsCol().doc();
  const doc = { ...data, createdAt: now, updatedAt: now };
  await ref.set(doc);
  return { ...data, id: ref.id, createdAt: now.toDate(), updatedAt: now.toDate() };
}

export async function getUpscaleJobById(jobId: string): Promise<VideoUpscaleJob | null> {
  const doc = await upscaleJobsCol().doc(jobId).get();
  if (!doc.exists) return null;
  return docToUpscaleJob(doc.data() as FirestoreDocData, doc.id);
}

export async function updateUpscaleJob(
  jobId: string,
  data: Partial<Omit<VideoUpscaleJob, "id" | "createdAt">>
): Promise<void> {
  await upscaleJobsCol().doc(jobId).update({
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function getUserUpscaleJobs(
  userId: string,
  limit = 20,
  startAfter?: string
): Promise<VideoUpscaleJob[]> {
  let query = upscaleJobsCol()
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (startAfter) {
    const cursor = await upscaleJobsCol().doc(startAfter).get();
    query = query.startAfter(cursor);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => docToUpscaleJob(doc.data() as FirestoreDocData, doc.id));
}
