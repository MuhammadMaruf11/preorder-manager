/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import PreorderForm from "@/components/PreorderForm";
import { prisma } from "@/lib/db";

export default async function EditPreorderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preorder = await prisma.preorder.findUnique({ where: { id: parseInt(id) } });
  if (!preorder) notFound();
  return <PreorderForm mode="edit" initial={preorder as any} />;
}