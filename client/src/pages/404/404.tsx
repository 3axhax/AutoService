import React from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";

const NotFoundPage: React.FC = () => {
  useDocumentTitle("404");
  return (
    <div>
      <h1 className={"p-4 text-3xl"}>Page Not Found</h1>
    </div>
  );
};

export default NotFoundPage;
