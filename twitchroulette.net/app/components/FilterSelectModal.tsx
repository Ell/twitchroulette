import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Select from "react-select";

import type { ChannelTag, Game } from "~/twitch";

export type FilterSet = {
  gameBlackList: Game[];
  tagBlackList: ChannelTag[];
};

type FilterSelectModalProps = {
  buttonText: string;
  games: Game[];
  tags: ChannelTag[];
  filterSet?: FilterSet;
  onFilterSetSaved: (filterSet: FilterSet) => void;
};

export function FilterSelectModal({
  buttonText,
  games,
  tags,
  onFilterSetSaved,
  filterSet = { gameBlackList: [], tagBlackList: [] },
}: FilterSelectModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentFilterSet, setCurrentFilterSet] =
    React.useState<FilterSet>(filterSet);

  function onSave() {
    onFilterSetSaved(currentFilterSet);
    closeModal();
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const gameOptions = games.map((game) => {
    return {
      value: game,
      label: game.name,
    };
  });

  const selectedGameOptions = currentFilterSet.gameBlackList.map((game) => {
    return {
      value: game,
      label: game.name,
    };
  });

  function onGameSelectChange(
    option: readonly { value: Game; label: string }[]
  ) {
    setCurrentFilterSet({
      ...currentFilterSet,
      gameBlackList: [...option.map((o) => o.value)],
    });
  }

  const tagOptions = tags.map((tag) => {
    return {
      value: tag,
      label: tag.name,
    };
  });

  const selectedTagOptions = currentFilterSet.tagBlackList.map((tag) => {
    return {
      value: tag,
      label: tag.name,
    };
  });

  function onTagSelectChange(
    option: readonly { value: ChannelTag; label: string }[]
  ) {
    setCurrentFilterSet({
      ...currentFilterSet,
      tagBlackList: [...option.map((o) => o.value)],
    });
  }

  return (
    <>
      <div className="inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="text-sm cursor-pointer text-center p-4"
        >
          {buttonText}
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex h-full justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit Your Filters
                  </Dialog.Title>

                  <div className="flex flex-col mt-8">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="games"
                        className="block text-sm font-medium leading-6"
                      >
                        Blacklist Games
                      </label>
                      <div className="mt-2">
                        <Select
                          isMulti
                          name="games"
                          defaultValue={selectedGameOptions}
                          options={gameOptions}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          onChange={onGameSelectChange}
                        />
                      </div>
                    </div>
                    <div className="mt-8">
                      <label
                        htmlFor="games"
                        className="block text-sm font-medium leading-6"
                      >
                        Blacklist Tags
                      </label>
                      <Select
                        isMulti
                        name="tags"
                        defaultValue={selectedTagOptions}
                        options={tagOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={onTagSelectChange}
                      />
                    </div>
                  </div>

                  <div className="mt-8 self-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onSave}
                    >
                      Save
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
