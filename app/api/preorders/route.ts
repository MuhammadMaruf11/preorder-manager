/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const validSortFields = ["name", "createdAt", "startsAt", "endsAt"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where =
      filter === "active" ? { status: true } :
      filter === "inactive" ? { status: false } :
      {};

    const [data, total] = await Promise.all([
      prisma.preorder.findMany({
        where,
        orderBy: { [orderField]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.preorder.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const preorder = await prisma.preorder.create({
      data: {
        name: body.name,
        products: body.products ?? 1,
        preorderWhen: body.preorderWhen ?? "regardless-of-stock",
        startsAt: new Date(body.startsAt),
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        status: body.status === 1 || body.status === true,
      },
    });
    return NextResponse.json(preorder, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}