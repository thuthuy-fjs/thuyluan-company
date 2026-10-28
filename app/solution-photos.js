import { editableImage } from "./editor-content";

export const solutionSlideInterval = 5000;

const photoSet = (group, descriptions, dimensions) =>
  descriptions.map((alt, index) => ({
    src: editableImage(`/assets/solution-${group}-${String(index + 1).padStart(2, "0")}.jpg`),
    alt,
    width: dimensions[index][0],
    height: dimensions[index][1],
  }));

export const solutionPhotos = {
  factory: photoSet(
    "factory",
    [
      "Người lao động dùng bữa tại khu nhà ăn",
      "Không gian nhà ăn phục vụ đông người",
      "Bữa ăn tập thể tại nhà máy",
      "Hoạt động phục vụ trong giờ ăn",
      "Nhà ăn với nhiều bàn phục vụ người lao động",
    ],
    Array.from({ length: 5 }, () => [1280, 576]),
  ),
  office: photoSet(
    "office",
    [
      "Khay suất ăn với cá, rau và canh",
      "Khay suất ăn với tôm và các món mặn",
      "Khay suất ăn với rau, thịt và món tráng miệng",
      "Khay suất ăn với cá, trứng và rau xanh",
      "Khay suất ăn với canh, thịt và rau",
    ],
    [[1280, 960], [1280, 960], [1280, 960], [1280, 1172], [1280, 960]],
  ),
  contract: photoSet(
    "contract",
    [
      "Nhân viên chuẩn bị khu vực phục vụ suất ăn",
      "Hoạt động sắp xếp nhà ăn trước giờ phục vụ",
      "Khu vực phục vụ được chuẩn bị theo số lượng suất ăn",
      "Khu vực sơ chế và vệ sinh dụng cụ bếp",
      "Khu vực lưu mẫu và bảo quản dụng cụ bếp",
    ],
    Array.from({ length: 5 }, () => [1276, 956]),
  ),
};
