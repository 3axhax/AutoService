import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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
    <div className={"inline-flex lg:flex lg:w-full justify-center gap-3"}>
      <button
        type={"button"}
        onClick={handlerEdit}
        className={
          "w-8 h-8 inline-flex justify-center items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600 transition-colors cursor-pointer"
        }
      >
        <span className={"sr-only"}>Редактировать</span>
        <PencilSquareIcon className="w-5 h-5" />
      </button>
      <button
        type={"button"}
        onClick={handlerDelete}
        className={
          "w-8 h-8 inline-flex justify-center items-center text-red-600 shadow-red-600/75 hover:text-red-800 transition-colors cursor-pointer"
        }
      >
        <span className={"sr-only"}>Удалить</span>
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
