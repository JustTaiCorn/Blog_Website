import Header from "@editorjs/header";
import Image from "@editorjs/image";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
//@ts-ignore
import Marker from "@editorjs/marker";
//@ts-ignore
import Embed from "@editorjs/embed";
export const tools = {
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      levels: [1, 2, 3],
      placeholder: "VIết tiêu đề",
      defaultLevel: 2,
    },
  },
  Image,
  List: {
    class: List,
    inlineToolbar: true,
  },
  Quote,
  InlineCode,
  Embed,
  Marker,
};
