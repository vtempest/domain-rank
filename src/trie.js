
/**
 * A trie structure to efficiently store and search for strings.
 * 
    import Trie from './trie.js';
    var trie = new Trie();
    trie.extend("aa");
    trie.commonPrefixSearch(a)

 */
export class Trie {
    constructor() {
        this.root = TrieNode.default();
    }

    /**
     * Adds one or more `texts` to the trie.
     * @param {string[]} texts The strings to add to the trie.
     */
    extend(texts) {
        for (let text of texts) {
            this.push(text);
        }
    }

    /**
     * Adds text to the trie.
     * @param {string} text The string to add to the trie.
     */
    push(text) {
        let node = this.root;
        for (let ch of text) {
            let child = node.children.get(ch);
            if (child === undefined) {
                child = TrieNode.default();
                node.children.set(ch, child);
            }
            node = child;
        }
        node.isLeaf = true;
    }

    /**
     * Searches the trie for all strings with a common prefix of `text`.
     * @param {string} text The common prefix to search for.
     * @yields {string} Each string in the trie that has `text` as a prefix.
     */
    *commonPrefixSearch(text) {
        let node = this.root;
        let prefix = "";
        for (let i = 0; i < text.length && node !== undefined; ++i) {
            const ch = text[i];
            prefix += ch;
            node = node.children.get(ch);
            if (node !== undefined && node.isLeaf) {
                yield prefix;
            }
        }
    }
}

/**
 * Represents a node in a character trie.
 */
class TrieNode {
    /**
     * Create a new TrieNode.
     * @param {boolean} isLeaf Whether the node is a leaf node or not.
     * @param {Map<string, TrieNode>} children A map containing the node's children, where the key is a character and the value is a `TrieNode`.
     */
    constructor(isLeaf, children) {
        this.isLeaf = isLeaf;
        this.children = children;
    }

    /**
     * Returns a new `TrieNode` instance with default values.
     * @returns {TrieNode} A new `TrieNode` instance with `isLeaf` set to `false` and an empty `children` map.
     */
    static default() {
        return new TrieNode(false, new Map());
    }
}
