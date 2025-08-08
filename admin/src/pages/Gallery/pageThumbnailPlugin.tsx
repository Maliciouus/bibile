import * as React from "react";
import type { Plugin, RenderViewer } from "@react-pdf-viewer/core";

export interface PageThumbnailPluginProps {
  PageThumbnail: React.ReactElement;
}

export const pageThumbnailPlugin = (
  props: PageThumbnailPluginProps
): Plugin => {
  const { PageThumbnail } = props;

  return {
    renderViewer: (renderProps: RenderViewer) => {
      let { slot } = renderProps;

      slot.children = PageThumbnail;

      // Reset the sub slot
      //@ts-ignore
      slot.subSlot.attrs = {};
      //@ts-ignore
      slot.subSlot.children = <></>;

      return slot;
    },
  };
};
