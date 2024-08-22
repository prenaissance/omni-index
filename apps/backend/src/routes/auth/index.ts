import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ObjectId } from "@fastify/mongodb";

import { Item, ITEMS_COLLECTION } from "~/entities/item";
import { User, USERS_COLLECTION } from "~/entities/user";

const RequestSchema = Type.Object({
  userId: Type.String({ format: "uuid" }),
  permissions: Type.Array(
    Type.Enum({
      user: "user",
      admin: "admin",
    })
  ),
});

const ResponseSchema = Type.Object({
  token: Type.String({ description: "JWT token" }),
});

const defaultItems: Omit<Item, "_id" | "userId">[] = [
  {
    templateId: ObjectId.createFromTime(1),
    order: 0,
  },
  {
    templateId: ObjectId.createFromTime(1),
    order: 1,
  },
  {
    templateId: ObjectId.createFromTime(2),
    order: 2,
  },
];

const authRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.post(
    "/login",
    {
      schema: {
        body: RequestSchema,
        response: {
          200: ResponseSchema,
        },
      },
    },
    async (request) => {
      const { userId, permissions } = request.body;
      const token = app.jwt.sign({
        sub: userId,
        permissions,
      });

      const users = app.mongo.db!.collection<User>(USERS_COLLECTION);

      const isNewUser = !(await users.countDocuments({
        id: userId,
      }));

      if (isNewUser) {
        await users.insertOne({
          id: userId,
        });
        await app.mongo.db!.collection<Item>(ITEMS_COLLECTION).insertMany(
          defaultItems.map((item) => ({
            ...item,
            userId,
          }))
        );
      }

      return { token };
    }
  );
};

export default authRoutes;
