"use client";

import AddNewImageForm from "./links.AddNewImageForm";
import type { ImageFormData } from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";

interface Props {
  formData: ImageFormData;
  setFormData: (data: ImageFormData) => void;
  onSave: () => void;
  onCancel?: () => void;
  isSaveDisabled?: boolean;
  existingSections?: SectionItem[];
}

const AddNewImageCarouselForm = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  isSaveDisabled,
  existingSections,
}: Props) => {
  const enforced = { ...formData, layout: "carousel" as const };
  const handleSet = (d: ImageFormData) => setFormData({ ...d, layout: "carousel" });
  return (
    <AddNewImageForm
      existingSections={existingSections}
      formData={enforced}
      isSaveDisabled={isSaveDisabled}
      maxImages={10}
      onCancel={onCancel}
      onSave={onSave}
      setFormData={handleSet}
    />
  );
};

export default AddNewImageCarouselForm;