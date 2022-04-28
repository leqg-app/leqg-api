const tap = require("tap");

const diffMapper = require("../../src/v1/utils/diffMapper.js");

const tests = [
  {
    name: "Nothing",
    before: null,
    after: null,
    output: [],
  },
  {
    name: "Empty objects",
    before: {},
    after: {},
    output: [],
  },
  {
    name: "Identic objects",
    before: {
      name: null,
      products: [
        {
          id: 1,
          name: "Leffe",
        },
      ],
    },
    after: {
      name: null,
      products: [
        {
          id: 1,
          name: "Leffe",
        },
      ],
    },
    output: [],
  },
  {
    name: "Add regular field",
    before: {
      products: [
        {
          id: 1,
          name: "Leffe",
        },
      ],
    },
    after: {
      name: "Chez Padre",
      products: [
        {
          id: 1,
          name: "Leffe",
        },
      ],
    },
    output: [
      {
        field: "name",
        type: "created",
        delta: "Chez Padre",
      },
    ],
  },
  {
    name: "Add item in empty array",
    before: {
      products: [],
    },
    after: {
      products: [
        {
          name: "Leffe",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "created",
        delta: { name: "Leffe" },
      },
    ],
  },
  {
    name: "Add item in non-empty array",
    before: {
      products: [
        {
          id: 1,
          name: "Leffe",
        },
      ],
    },
    after: {
      products: [
        {
          id: 1,
          name: "Leffe",
        },
        {
          name: "Kro",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "created",
        delta: { name: "Kro" },
      },
    ],
  },
  {
    name: "Add several items in empty array",
    before: {
      products: [],
    },
    after: {
      products: [
        {
          name: "Leffe",
        },
        {
          name: "Kro",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "created",
        delta: { name: "Leffe" },
      },
      {
        field: "products",
        type: "created",
        delta: { name: "Kro" },
      },
    ],
  },
  {
    name: "Add several items in non-empty array",
    before: {
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    after: {
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          name: "Leffe",
        },
        {
          name: "Kro",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "created",
        delta: { name: "Leffe" },
      },
      {
        field: "products",
        type: "created",
        delta: { name: "Kro" },
      },
    ],
  },
  {
    name: "Update regular field",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    after: {
      name: "Chez Padre",
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    output: [
      {
        field: "name",
        type: "updated",
        delta: "Chez Papa",
      },
    ],
  },
  {
    name: "Update item in array",
    before: {
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    after: {
      products: [
        {
          id: 1,
          name: "Kro",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "updated",
        delta: {
          id: 1,
          name: "Grim",
        },
      },
    ],
  },
  {
    name: "Update several items in array",
    before: {
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          id: 2,
          name: "Leffe",
        },
      ],
    },
    after: {
      products: [
        {
          id: 1,
          name: "Kro",
        },
        {
          id: 2,
          name: "Goudale",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "updated",
        delta: {
          id: 1,
          name: "Grim",
        },
      },
      {
        field: "products",
        type: "updated",
        delta: {
          id: 2,
          name: "Leffe",
        },
      },
    ],
  },
  {
    name: "Delete regular field",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    after: {
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    output: [
      {
        field: "name",
        type: "deleted",
        delta: "Chez Papa",
      },
    ],
  },
  {
    name: "Delete array",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    after: {
      name: "Chez Papa",
    },
    output: [
      {
        field: "products",
        type: "deleted",
        delta: [
          {
            id: 1,
            name: "Grim",
          },
        ],
      },
    ],
  },
  {
    name: "Delete item in array",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
      ],
    },
    after: {
      name: "Chez Papa",
      products: [],
    },
    output: [
      {
        field: "products",
        type: "deleted",
        delta: {
          id: 1,
          name: "Grim",
        },
      },
    ],
  },
  {
    name: "Delete several items in array",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          id: 2,
          name: "Kro",
        },
      ],
    },
    after: {
      name: "Chez Papa",
      products: [],
    },
    output: [
      {
        field: "products",
        type: "deleted",
        delta: {
          id: 1,
          name: "Grim",
        },
      },
      {
        field: "products",
        type: "deleted",
        delta: {
          id: 2,
          name: "Kro",
        },
      },
    ],
  },
  {
    name: "Delete item in array and add new one",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          id: 2,
          name: "Kro",
        },
      ],
    },
    after: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          name: "Kro",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "deleted",
        delta: {
          id: 2,
          name: "Kro",
        },
      },
      {
        field: "products",
        type: "created",
        delta: {
          name: "Kro",
        },
      },
    ],
  },
  {
    name: "Delete item in array and add new one with id",
    before: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          id: 2,
          name: "Kro",
        },
      ],
    },
    after: {
      name: "Chez Papa",
      products: [
        {
          id: 1,
          name: "Grim",
        },
        {
          id: 3,
          name: "Kro",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "deleted",
        delta: {
          id: 2,
          name: "Kro",
        },
      },
      {
        field: "products",
        type: "created",
        delta: {
          id: 3,
          name: "Kro",
        },
      },
    ],
  },
  {
    name: "Create collection",
    before: {
      name: "Chez Papa",
    },
    after: {
      name: "Chez Papa",
      products: [
        {
          name: "Leffe",
        },
      ],
    },
    output: [
      {
        field: "products",
        type: "created",
        delta: [
          {
            name: "Leffe",
          },
        ],
      },
    ],
  },
];

tap.test("", async function (t) {
  for (const test of tests) {
    t.test(test.name, async function (t) {
      t.same(
        diffMapper(test.before, test.after, ["name", "products"]),
        test.output
      );
    });
  }
});
