import {
  parseRestication,
  generateSimpleTypes,
  generateComplexTypes,
  getElementAttributes,
} from "./index";

describe("XSD parser for codemirror", () => {
  it.each([
    [
      {
        "xs:enumeration": [
          {
            $: {
              value: "Paris",
            },
          },
          {
            $: {
              value: "Luxembourg",
            },
          },
        ],
      },
      ["Paris", "Luxembourg"],
    ],
    [{}, null],
  ])("should parse restriction %o to %o", (restiction, result) => {
    expect(parseRestication(restiction)).toEqual(result);
  });

  it.each([
    [
      {
        "xs:simpleType": [
          {
            $: {
              name: "orderidtype",
            },

            "xs:restriction": {
              $: {
                base: "xs:string",
              },
              "xs:pattern": {
                value: "[0-9]{6}",
              },
              "xs:enumeration": [
                {
                  $: {
                    value: "Audi",
                  },
                },
                {
                  $: {
                    value: "Golf",
                  },
                },
                {
                  $: {
                    value: "BMW",
                  },
                },
              ],
            },
          },
        ],
      },
      { orderidtype: { attrs: {}, children: ["Audi", "Golf", "BMW"] } },
    ],
  ])("should generate simpleType", (root, result) => {
    expect(generateSimpleTypes(root)).toEqual(result);
  });

  it("should generate complexType", () => {
    const shema = {
      "xs:schema": {
        $: { "xmlns:xs": "http://www.w3.org/2001/XMLSchema" },
        "xs:element": [{ $: { name: "employee", type: "fullpersoninfo" } }],
        "xs:complexType": [
          {
            $: { name: "personinfo" },
            "xs:sequence": [
              {
                "xs:element": [
                  { $: { name: "firstname", type: "xs:string" } },
                  { $: { name: "lastname", type: "xs:string" } },
                ],
              },
            ],
          },
          {
            $: { name: "fullpersoninfo" },
            "xs:complexContent": [
              {
                "xs:extension": [
                  {
                    $: { base: "personinfo" },
                    "xs:sequence": [
                      {
                        "xs:element": [
                          { $: { name: "address", type: "xs:string" } },
                          { $: { name: "city", type: "xs:string" } },
                          { $: { name: "country", type: "xs:string" } },
                        ],
                      },
                    ],
                    "xs:attribute": [
                      { $: { ref: "orderid", use: "required" } },
                      { $: { name: "lang", type: "xs:string" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const complexType = generateComplexTypes(shema["xs:schema"]);

    expect(complexType).toEqual({
      fullpersoninfo: {
        children: ["address", "city", "country"],
        attrs: {
          lang: null,
        },
      },
      personinfo: {
        children: ["firstname", "lastname"],
        attrs: {},
      },
    });
  });

  it("should parse attributes", () => {
    const element = {
      "xs:attribute": [
        {
          $: { name: "eyecolor" },
          "xs:simpleType": [
            {
              "xs:restriction": [
                {
                  $: { base: "xs:string" },
                  "xs:pattern": [{ $: { value: "blue|brown|green|grey" } }],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(getElementAttributes(element)).toEqual({
      eyecolor: ["blue", "brown", "green", "grey"],
    });
  });
});
