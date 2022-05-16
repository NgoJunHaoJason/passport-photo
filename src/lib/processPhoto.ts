import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import type { ImageType } from "@tensorflow-models/body-pix/dist/types";

const leftFaceId = 0;
const rightFaceId = 1;
const torsoFrontId = 12;
const backgroundId = -1;

export const icaPhotoWidth = 400;
export const icaPhotoHeight = 514;

const icaHeadRatio = 0.75;
const yMarginRatio = (1 - icaHeadRatio) / 2;

const topMarginYCoordinate = Math.trunc(icaPhotoHeight * yMarginRatio);
const bottomMarginYCoordinate = icaPhotoHeight - topMarginYCoordinate;

const processPhoto = async (photo: ImageData | ImageType) => {
  console.log("processPhoto", photo.width, photo.height);
  const segmentation = await loadAndPredict(photo);
  const headAndTorso = mapHeadAndTorso(segmentation);

  return computeCropRegion(headAndTorso);
};

export default processPhoto;

const loadAndPredict = async (photo: ImageData | ImageType) => {
  console.log("loadAndPredict");
  const net = await bodyPix.load();
  return await net.segmentPersonParts(photo);
};

const mapHeadAndTorso = (segmentation: bodyPix.SemanticPartSegmentation) => {
  console.log("mapHeadAndTorso");
  segmentation.data = segmentation.data.map(pixelId => {
    switch (pixelId) {
      case backgroundId:
        return backgroundId;
      case leftFaceId:
      case rightFaceId:
        return leftFaceId;
      default:
        return torsoFrontId;
    }
  });
  return segmentation;
};

const computeCropRegion = (headAndTorso: bodyPix.SemanticPartSegmentation) => {
  console.log("computeCropRegion");
  const {
    leftMostPoint,
    rightMostPoint,
    topMostPoint,
    bottomMostPoint,
  } = computeHeadCoordinates(headAndTorso);
  console.log("head coordinates:", topMostPoint, bottomMostPoint);

  const scaleRatio = computeScaleRatio(topMostPoint.y, bottomMostPoint.y);
  console.log("scale ratio:", scaleRatio);

  const scaledHeadWidth = (rightMostPoint.x - leftMostPoint.x) * scaleRatio;
  const leftMargin = (icaPhotoWidth - scaledHeadWidth) / 2;
  const x = (leftMostPoint.x * scaleRatio) - leftMargin;

  const scaledTopofHeadY = Math.trunc(topMostPoint.y * scaleRatio);
  const y = scaledTopofHeadY - topMarginYCoordinate;

  return {
    x,
    y,
    scaleRatio,
  };
};

const computeHeadCoordinates = (segmentation: bodyPix.SemanticPartSegmentation) => {
  console.log("computeHeadYCoordinates");

  type Pixel = {
    pixelIndex: number;
    pixelId: number;
  }
  const coordinates: Pixel[] = [];
  segmentation.data.forEach((pixelId, pixelIndex) => coordinates.push({ pixelIndex, pixelId }));

  const computePoint = (pixelIndex: number) => {
    return {
      x: Math.trunc(pixelIndex % segmentation.width),
      y: Math.trunc(pixelIndex / segmentation.width),
    };
  };

  const headCoordinates = coordinates
    .filter(({ pixelIndex, pixelId }) => pixelId === leftFaceId)
    .map(({ pixelIndex, pixelId }) => computePoint(pixelIndex));

  const leftMostPoint = headCoordinates
    .reduce((previous, current) => current.x < previous.x ? current : previous);

  const rightMostPoint = headCoordinates
    .reduce((previous, current) => current.x > previous.x ? current : previous);

  const topMostPoint = headCoordinates
    .reduce((previous, current) => current.y < previous.y ? current : previous);

  const bottomMostPoint = headCoordinates
    .reduce((previous, current) => current.y > previous.y ? current : previous);

  return {
    leftMostPoint,
    rightMostPoint,
    topMostPoint,
    bottomMostPoint,
  };
}

const computeScaleRatio = (topOfHeadYCoordinate: number, bottomOfHeadYCoordinate: number) => {
  console.log("computeScaleRatio");
  const currentHeadLength = bottomOfHeadYCoordinate - topOfHeadYCoordinate;
  const newHeadLength = bottomMarginYCoordinate - topMarginYCoordinate;
  return newHeadLength / currentHeadLength;
};

const convertSegmentationToMask = (segmentation: bodyPix.SemanticPartSegmentation) => {
  console.log("convertSegmentationToMask");
  return bodyPix.toColoredPartMask(segmentation);
}