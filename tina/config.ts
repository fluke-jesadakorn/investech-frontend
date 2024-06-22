import { UsernamePasswordAuthJSProvider, TinaUserCollection } from "tinacms-authjs/dist/tinacms";
import { defineConfig, Template, LocalAuthProvider } from "tinacms";
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";
const branch = process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    "main";
const heroBlock: Template = {
    name: "hero",
    label: "Hero",
    ui: {
        defaultItem: {
            tagline: "Here's some text above the other text",
            headline: "This Big Text is Totally Awesome",
            text: "Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.",
        },
    },
    fields: [
        {
            type: "string",
            label: "Tagline",
            name: "tagline",
        },
        {
            type: "string",
            label: "Headline",
            name: "headline",
        },
        {
            type: "string",
            label: "Text",
            name: "text",
            ui: {
                component: "textarea",
            },
        },
    ],
};
const featureBlock: Template = {
    name: "features",
    label: "Features",
    fields: [
        {
            type: "object",
            label: "Feature Items",
            name: "items",
            list: true,
            fields: [
                {
                    type: "string",
                    label: "Title",
                    name: "title",
                },
                {
                    type: "string",
                    label: "Text",
                    name: "text",
                },
            ],
        },
    ],
};
const contentBlock: Template = {
    name: "content",
    label: "Content",
    ui: {
        defaultItem: {
            body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.",
        },
    },
    fields: [
        {
            type: "string",
            ui: {
                component: "textarea",
            },
            label: "Body",
            name: "body",
        },
    ],
};
export default defineConfig({
    contentApiUrlOverride: "/api/tina/gql",
    authProvider: isLocal ? new LocalAuthProvider() : new UsernamePasswordAuthJSProvider(),
    branch,
    // Get this from tina.io
    clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
    // Get this from tina.io
    token: process.env.TINA_TOKEN,
    build: {
        outputFolder: "admin",
        publicFolder: "public",
    },
    media: {
        tina: {
            mediaRoot: "",
            publicFolder: "public",
        },
    },
    // authProvider: isLocal
    //   ? new LocalAuthProvider()
    //   : new UsernamePasswordAuthJSProvider(),
    // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
    schema: {
        collections: [
            TinaUserCollection,
            {
                name: "page",
                label: "Pages",
                path: "content/pages",
                format: "md",
                fields: [
                    {
                        type: "object",
                        list: true,
                        name: "blocks",
                        label: "Sections",
                        templates: [heroBlock, featureBlock, contentBlock],
                    },
                ],
            }
        ]
    }
});
