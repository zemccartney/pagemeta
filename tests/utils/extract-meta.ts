import type { Element, RootContent } from "hast";

import rehypeParse from "rehype-parse";
import { unified } from "unified";

const findHead = (nodes: RootContent[]): Element | undefined => {
    for (const node of nodes) {
        if (node.type !== "element") continue;
        if (node.tagName === "head") return node;
        const found = findHead(node.children as RootContent[]);
        if (found) return found;
    }
};

const extractElement = (el: Element) => {
    if (el.tagName === "title") {
        const textNode = el.children.find((c) => c.type === "text");
        return { properties: { text: textNode?.value ?? "" }, tag: "title" };
    }

    if (el.tagName === "meta" || el.tagName === "link") {
        return { properties: el.properties, tag: el.tagName };
    }
};

export const extractMeta = (html: string) => {
    const tree = unified().use(rehypeParse).parse(html);
    const head = findHead(tree.children);
    if (!head) return [];

    return head.children
        .filter((child) => child.type === "element")
        .map((el) => extractElement(el))
        .filter((el) => el !== undefined);
};
