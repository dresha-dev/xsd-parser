const schemaInfo = {};

const generateElement = (elementName, elementData) => {
  schemaInfo[elementName] = elementData;
};

const isSimpleElement = (element): Boolean => {
  return !!element;
};

const parseElement = (element) => {
  if (isSimpleElement(element)) {
    // Simple elements cannot have attributes.

    generateElement(element.name, {
      children: [],
      attrs: {},
    });
  } else {
  }
};

const complexType = {};

const generateComplexType = (complexType) => {};

const getTypeName = (complexType): string => {
  return "typeName";
};

class ComplexType {
  constructor() {
    this._attrs = {};
    this._children = [];
  }

  addAttributes(attrs) {
    attrs.forEach((attr) => {
      this._attrs[attr.name] = attr.values;
    });
  }

  addChildren(children) {
    this._children.concat(children);
  }

  extendBase(extension) {
    // TODO: Extends attributes and childre from base extension
  }
}

const getComplexTypeElements = (complexType) => {
  /*
    A complex element is an XML element that contains other elements and/or attributes.
    There are four kinds of complex elements:
    1. empty elements
    2. elements that contain only other elements
    3. elements that contain only text
    4. elements that contain both other elements and text

    NOTE: The elements of 4th group fall under the conditions of 2nd
    https://www.w3schools.com/xml/schema_complex.asp
  */
  const result = new ComplexType();

  if (complexType.complexContent) {
    result.extendBase(complexType.complexContent.extension);

    if (complexType.complexContent.simpleContent) {
      /*
        Elements of 3rd group.
        This type contains only simple content (text and attributes).
        https://www.w3schools.com/xml/schema_complex_text.asp
      */

      if (complexType.complexContent.simpleContent.restriction.attributes) {
        result.addAttributes(
          complexType.complexContent.simpleContent.restriction.attributes
        );
      } else {
        result.extendBase(complexType.complexContent.simpleContent.extension);
        result.addAttributes(
          complexType.complexContent.simpleContent.extension.attributes
        );
      }
    } else {
      /* 
        Elements of 2rd and 4th groups.
        This type contains only elements.
        https://www.w3schools.com/xml/schema_complex_elements.asp
      */

      if (complexType.complexContent.restriction) {
        result.addAttributes(complexType.complexContent.restriction.attributes);
      }

      if (complexType.complexContent.extension.sequence) {
        result.addChildren(
          complexType.complexContent.extension.sequence.elements
        );
      }
    }
  } else {
    /*
        1st group of elements.
        An empty complex element cannot have contents, only attributes
        https://www.w3schools.com/xml/schema_complex_empty.asp
      */
    if (complexType.sequence) {
      result.addChildren(complexType.sequence.elements);
    }

    if (complexType.attributes) {
      result.addAttributes(complexType.attributes);
    }
  }
};

const getGroupElementsContent = (group) => {
  const text = `
        <xs:sequence>
            <xs:element name="firstname" type="xs:string"/>
            <xs:element name="lastname" type="xs:string"/>
            <xs:element name="birthday" type="xs:date"/>
        </xs:sequence>
    `;

  return {
    sequence: {
      elements: [
        { name: "firstname" },
        { name: "lastname" },
        { name: "birthday" },
      ],
    },
  };
};

const getGroupAttributesContent = (group) => {
  const attributeGroup = `
        <xs:attributeGroup name="personattrgroup">
            <xs:attribute name="firstname" type="xs:string"/>
            <xs:attribute name="lastname" type="xs:string"/>
            <xs:attribute name="birthday" type="xs:date"/>
        </xs:attributeGroup>
    `;

  return {
    firstname: null,
    lastname: null,
    birthday: null,
  };
};

const getGroupAttributes = (attrGroup) => {
  const attributes = getGroupAttributesContent(attrGroup);

  return attributes;
};

const getGroupElements = (elementsGroup) => {
  const content = getGroupElementsContent(elementsGroup);

  return getElementsFromIndicator(content);
};

const parseSimpleElement = (element) => {
  const elementName = getAttribute(element, "name");
  const elementType = getAttribute(element, "type");
  const elementRef = getAttribute(element, "ref");

  return elementName;
};

// https://www.w3schools.com/xml/schema_complex_indicators.asp
const getElementsFromIndicator = (content) => {
  const indicators = ["xs:all", "xs:choice", "xs:sequence"];

  return indicators.reduce((state, indicator) => {
    if (content[indicator]) {
      const elements = content[indicator][0]["xs:element"];

      if (elements) {
        state = elements.map(parseSimpleElement);
      }

      // if (content[indicator].group) {
      //   elements.concat(getGroupElements(content[indicator].group));
      // }
    }
    return state;
  }, []);
};

const parseComplexType = (complexType) => {
  const typeName = getTypeName(complexType);

  getComplexTypeElements(complexType);
};

// FOR ELEMENTS:
// TODO: Implement substitution elements https://www.w3schools.com/xml/schema_complex_subst.asp

// FOR ATTRIBUTES:
// TODO: Parse restriction pattern https://www.w3schools.com/xml/schema_facets.asp

type AttributeValue = null | string[];
type Children = string[];

const parseFacets = (restriction): AttributeValue => {
  /*
    <xs:element name="car">
        <xs:simpleType>
            <xs:restriction base="xs:string">
            <xs:enumeration value="Audi"/>
            <xs:enumeration value="Golf"/>
            <xs:enumeration value="BMW"/>
            </xs:restriction>
        </xs:simpleType>
    </xs:element>
  */

  if (restriction.enumerations) {
    return restriction.enumerations.map((enumeration) => enumeration.value);
  }

  return null;
};

// const fs = require("fs");
// const xml2js = require("xml2js");
// const path = require("path");
// const parser = new xml2js.Parser();

// fs.readFile(
//   path.resolve(__dirname, "../tests/data/imsqti_v2p2p2.xsd"),
//   (err, data) => {
//     parser.parseString(data, function (err, result) {
//       console.log("Done", JSON.stringify(result));
//     });
//   }
// );

/*
1. Parse root elements

const attributeGroup = {};
const group = {};
const simpleType = {};
const complexType = {};
const element = {};


*/

["xs:element"].forEach((element) => {
  parseElement(element);
});

interface ElementAttributes {
  [key: string]: any;
  name?: string;
  ref?: string;
  substitutionGroup?: string;
}

interface ComplexType {
  "xs:extension"?: any;
}

interface BaseElement {
  $: ElementAttributes;
  "xs:complexType"?: ComplexType;
  "xs:simpleType"?: any;
}

interface Element extends BaseElement {
  name: string;
  type?: string;
}

interface SubstitutableElement {
  name: string;
  substitutionGroup: string;
}

interface RefElement {
  ref: string;
}

type XSElement = Element | SubstitutableElement | RefElement;

const isComplexType = (element: XSElement): Boolean => {
  return element.hasOwnProperty("xs:complexType");
};

const isSimpleType = (element: XSElement): Boolean => {
  return element.hasOwnProperty("xs:simpleType");
};

const getElementName = (element: XSElement): string => {
  if (element.hasOwnProperty("ref")) {
    return (element as RefElement).ref;
  }

  return (element as Element | SubstitutableElement).name;
};

// TODO: ComplexType
const hasExtension = (element: any) => {
  return element["xs:complexType"]["xs:complexContent"]["xs:extension"];
};

const hasComplexContent = (element: any) => {
  return element["xs:complexType"]["xs:complexContent"];
};

const hasSimpleContent = (element: any) => {
  return element["xs:complexType"]["xs:simpleContent"];
};

const getElementsFromExtenstion = (element: any) => {
  return getElementsFromIndicator(
    element["xs:complexType"]["xs:complexContent"]["xs:extension"]
  );
};

export const getPatterValues = (value: string) => {
  if (value.indexOf("|") > -1) {
    return null;
  }

  return value.split("|");
};

/**
 * Restrictions are used to define acceptable values for XML elements or attributes.
 * Restrictions on XML elements are called facets.
 * https://www.w3schools.com/xml/schema_facets.asp
 */
export const parseRestication = (restrictaion: any): null | string[] => {
  const enumerateValues = restrictaion["xs:enumeration"];
  const patternValues = restrictaion["xs:pattern"];

  if (enumerateValues) {
    return enumerateValues.map((enumeration) => enumeration.$.value);
  }

  if (patternValues) {
    return getPatterValues(getAttribute(patternValues[0], "value"));
  }

  return null;
};

export const parseRestictionAttributes = (restrictaion: any) => {
  const restrictAttributes = restrictaion["xs:attribute"];
  if (!restrictAttributes) {
    return {};
  }

  return restrictAttributes.map((attribute) => {
    return; // generate attribute
  });
};

const parseElement = (element: XSElement) => {
  /*
      A complex element is an XML element that contains other elements and/or attributes.
      There are four kinds of complex elements:
      1. empty elements
      2. elements that contain only other elements
      3. elements that contain only text
      4. elements that contain both other elements and text
  
      NOTE: The elements of 4th group fall under the conditions of 2nd
      https://www.w3schools.com/xml/schema_complex.asp
    */
  // const result = new ComplexType();
  const children: any[] = [];
  const attrs = {};

  if (isComplexType(element)) {
    if (hasComplexContent(element)) {
      if (hasExtension(element)) {
        children.concat(getElementsFromExtenstion(element));
      }

      if (hasSimpleContent(element)) {
        /*
          Elements of 3rd group.
          This type contains only simple content (text and attributes).
          https://www.w3schools.com/xml/schema_complex_text.asp
        */
        if (hasSimpleContent(element)["xs:extension"]) {
          result.addAttributes(
            hasSimpleContent(element)["xs:extension"].attributes
          );
        } else {
          result.addAttributes(
            hasSimpleContent(element)["xs:restriction"].attributes
          );
        }
      } else {
        /* 
          Elements of 2rd and 4th groups.
          This type contains only elements.
          https://www.w3schools.com/xml/schema_complex_elements.asp
        */

        children.concat(getElementsFromIndicator(hasComplexContent(element)));
      }
    }
  } else {
    /*
          1st group of elements.
          An empty complex element cannot have contents, only attributes
          https://www.w3schools.com/xml/schema_complex_empty.asp
        */
    children.concat(getElementsFromIndicator(hasComplexContent(element)));
  }
};

export default {};

const getAttribute = (element, key) => {
  return element.$[key];
};

/**
 * A simple element is an XML element that contains only text. It cannot contain any other elements or attributes.
 * https://www.w3schools.com/xml/schema_simple.asp
 * @param root
 */
export const generateSimpleTypes = (root) => {
  const simpleTypes = root["xs:simpleType"];

  if (!simpleTypes) {
    return {};
  }

  return simpleTypes.reduce((state, simpleType) => {
    const restrictions = simpleType["xs:restriction"];
    let children = [];

    if (restrictions) {
      children = parseRestication(restrictions);
    }

    state[getAttribute(simpleType, "name")] = {
      children,
      attrs: {},
    };

    return state;
  }, {});
};

/**
 * All attributes are declared as simple types.
 * https://www.w3schools.com/xml/schema_simple_attributes.asp
 * @param element
 */
export const getElementAttributes = (element) => {
  const attribute = element["xs:attribute"];

  if (!attribute) {
    return {};
  }

  return attribute.reduce((state, attr) => {
    let value = null;
    const attributeName = getAttribute(attr, "name");
    const simpleType = attr["xs:simpleType"];

    if (simpleType) {
      const restrictions = simpleType["xs:restriction"];

      if (restrictions) {
        value = parseRestication(restrictions);
      }
    }

    if (attributeName) {
      state[attributeName] = value;
    }

    return state;
  }, {});
};

/**
 * A complex element contains other elements and/or attributes.
 * https://www.w3schools.com/xml/schema_complex.asp
 * @param root
 */
export const generateComplexTypes = (root) => {
  const complexType = root["xs:complexType"];

  if (!complexType) {
    return {};
  }

  return complexType.reduce((state, cType) => {
    const typeName = getAttribute(cType, "name");
    const complexContent = cType["xs:complexContent"];
    let children = [];
    let attrs = {};

    if (complexContent) {
      const content = complexContent[0]["xs:extension"][0];

      children = getElementsFromIndicator(content);
      attrs = getElementAttributes(content);
    } else {
      children = getElementsFromIndicator(cType);
      attrs = getElementAttributes(cType);
    }

    state[typeName] = {
      children,
      attrs,
    };

    return state;
  }, {});
};
