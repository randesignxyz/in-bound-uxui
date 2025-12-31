import CrudWrapper from "@/components/DataCrud/CrudWrapper";
import { HrmPaths } from "..";
import { useState } from "react";
import ProbationList from "./components/list";

export default () => {
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  const refresh = () => {
    setForceUpdate((v) => v + 1);
  };

  return (
    // <CrudWrapper baseURL={HrmPaths.probationEvaluation}>
    //   {(view, id, navigate) => {
    //     const content = (() => {
    //       switch (view) {
    //         case "list":
    //           return (
                <ProbationList
                  onAdd={(id) => navigate?.goToCreate?.({ id })}
                  onDetail={(data) =>
                    navigate?.goToDetail?.({ id: data.id })
                  }
                  forceRefresh={forceUpdate}
                />
  //             );
  //
  //           default:
  //             throw new Error("Not compatible view");
  //         }
  //       })(); // ← This was missing! You opened `(()) =>` but never closed with })()`
  //
  //       return content; // ← Also missing return
  //     }}
  //   </CrudWrapper>
  );
};
