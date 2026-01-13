import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import {
  deleteAdditionalWork,
  getAdditionalWorksFromActiveShift,
} from "@entities/additionalWorks";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { EditAdditionalWorkForm } from "@features/editAdditionalWorkForm";

export const AdditionalWorksListActionButton = ({
  workId,
}: {
  workId: number;
}) => {
  const dispatch = useAppDispatch();

  const { openModal, closeModal } = useInfoModalData();

  const handlerDelete = () => {
    openModal({
      onAccess: () => {
        dispatch(deleteAdditionalWork(workId)).then((res) => {
          if (res.payload) {
            dispatch(getAdditionalWorksFromActiveShift());
          }
        });
      },
      title: `Уверены, что хотите удалить дополнительные работы?`,
    });
  };

  const handlerEdit = () => {
    openModal({
      title: `Редактирование записи #${workId}`,
      body: (
        <EditAdditionalWorkForm
          additionalWorkId={workId}
          edit={true}
          onSuccess={() =>
            dispatch(getAdditionalWorksFromActiveShift()).then(() =>
              closeModal(),
            )
          }
        />
      ),
    });
  };
  return (
    <div className={"flex justify-center gap-3"}>
      <button
        type={"button"}
        onClick={handlerEdit}
        className={
          "text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        }
      >
        <PencilSquareIcon className="w-5 h-5" />
      </button>
      <button
        type={"button"}
        onClick={handlerDelete}
        className={
          "text-red-600 hover:text-red-700 transition-colors cursor-pointer"
        }
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
