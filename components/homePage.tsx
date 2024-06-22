// homePage.tsx
"use client";

import { PageQuery, PageQueryVariables } from "@/tina/__generated__/types";
import { useTina, tinaField } from "tinacms/dist/react";

export default function HomePage(props: {
  data: PageQuery;
  variables: PageQueryVariables;
  query: string;
}) {
  const { data } = useTina(props);
  return (
    <div>
      {data.page?.blocks?.map((item, index) => {
        switch (item?.__typename) {
          case "PageBlocksHero":
            return (
              <div data-tina-field={tinaField(item, "tagline")} key={index}>
                {item.tagline}
              </div>
            );
        }
      })}
    </div>
  );
}
