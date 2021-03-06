# ICA Passport Photo

TODO:

1. refactor code
2. improve UI design
3. handle edge cases / scenarios
4. add features (e.g. normalisation, brighten / darken background, etc)
5. use different models depending on device (lighter on mobile)

References:

- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [GitHub Pages](https://levelup.gitconnected.com/how-to-publish-a-single-page-application-at-no-cost-with-github-pages-react-svelte-etc-897b8f75a22b)
- [Svelte GitHub Pages](https://github.com/sveltejs/kit/tree/master/packages/adapter-static#github-pages)
- [ICA Photo Guidelines](https://www.ica.gov.sg/photo-guidelines)

## Developing

Start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

To deploy your app:

```bash
npm run build
```

Fix `build/index.html` to use relative path due to [bug in Svelte's static adapter](https://github.com/sveltejs/kit/issues/4528)

- i.e. change `href="/internal"` to `href="./internal"`

Then:
```bash
npx gh-pages -d build -t true
```
