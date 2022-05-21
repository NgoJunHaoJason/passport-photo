<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import SubHeader from "$lib/components/SubHeader.svelte";
  import "../app.css";
  import processPhoto, { icaPhotoHeight, icaPhotoWidth } from "$lib/processPhoto";
  import { onMount } from "svelte";

  const contextId = "2d";

  let convertButton: HTMLButtonElement;
  let photoInput: HTMLInputElement;

  let photo: HTMLImageElement;

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;

  onMount(() => {
    console.log("onMount");
    initCanvas();
    initPhoto();
  });

  const initCanvas = () => {
    console.log("initCanvas");
    context = canvas.getContext(contextId);
    resetCanvas();
  };

  const initPhoto = () => {
    console.log("initPhoto");
    photo = new Image();
    photo.onload = () => {
      resetCanvas();
      if (context) {
        const scaleRatio = icaPhotoHeight / photo.height;
        context.scale(scaleRatio, scaleRatio);
        context.drawImage(photo, 0, 0);
        context.save();
      }
    };
  };

  const resetCanvas = () => {
    canvas.width = icaPhotoWidth;
    canvas.height = icaPhotoHeight;
    if (context) {
      context.fillStyle = "rgb(99 102 241)";
      context.fillRect(0, 0, icaPhotoWidth, icaPhotoHeight);
      context.save();
    }
  };

  const selectPhoto = () => {
    console.log("selectPhoto");
    displayOriginalPhoto();
    convertButton.disabled = false;
  };

  const displayOriginalPhoto = () => {
    console.log("displayOriginalPhoto");
    if (photoInput.files) {
      photo.src = URL.createObjectURL(photoInput.files[0]);
    }
  };

  const convert = async () => {
    console.log("convert");
    const cropInfo = await processPhoto(photo);
    displayPassportPhoto(cropInfo);
    convertButton.disabled = true;
  };

  const displayPassportPhoto = ({ x, y, scaleRatio }: any) => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = photo.width;
    tempCanvas.height = photo.height;

    const tempContext = tempCanvas.getContext(contextId);

    if (tempContext) {
      tempContext.scale(scaleRatio, scaleRatio);
      tempContext.drawImage(photo, 0, 0);

      const crop = tempContext.getImageData(x, y, icaPhotoWidth, icaPhotoHeight);
      context?.putImageData(crop, 0, 0);
      context?.save();
    }
  };
</script>

<svelte:head>
  <title>ICA Passport Photo</title>
  <meta name="ICA passport photo" content="ICA passport photo" />
</svelte:head>

<Header />
<SubHeader />
<div>
  <div class="text-center">
    <label for="photo-input" class="text-indigo-500 rounded border border-2 border-indigo-500 px-1">
      Select photo
    </label>
    <input
      id="photo-input"
      type="file"
      accept="image/*"
      bind:this={photoInput}
      on:change={selectPhoto}
      hidden
    />
    <button
      class="disabled:opacity-75 text-indigo-500 rounded border border-2 border-indigo-500 px-1"
      disabled
      bind:this={convertButton}
      on:click={convert}
    >
      Convert
    </button>
  </div>

  <div>
    <canvas class="mx-auto" bind:this={canvas} />
  </div>
</div>

<style>
  canvas {
    max-width: 400px;
    height: 514px;
  }
</style>
