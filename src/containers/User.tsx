import { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Button,
  HR,
  Tabs,
  TabsRef,
  Dropdown,
  Checkbox,
  TextInput,
  Accordion,
  Pagination,
} from "flowbite-react";
import Cookies from "js-cookie";
import Frame from "../components/Frame";
import NewTune from "../components/NewTune";
import NewSet from "../components/NewSet";
import NewSession from "../components/NewSession";
import DisplayTune from "../components/DisplayTune";
import DisplaySet from "../components/DisplaySet";
import DisplaySession from "../components/DisplaySession";
import { useUserData } from "../hooks/useUserData";
import { HiPlus } from "react-icons/hi";
import { IoIosClose } from "react-icons/io";
import { TUNE_TYPES } from "../shared/TuneOptions";

// Add these types at the top of the file, after imports
type TimeframeFilter = {
  all: boolean;
  week: boolean;
  month: boolean;
  unpracticed: boolean;
};

type TuneTypeFilter = {
  all: boolean;
  reel: boolean;
  jig: boolean;
  hornpipe: boolean;
  "slip jig": boolean;
  polka: boolean;
  slide: boolean;
  waltz: boolean;
  mazurka: boolean;
  march: boolean;
  barndance: boolean;
  clog: boolean;
  air: boolean;
  "slow air": boolean;
  strathspey: boolean;
  other: boolean;
};

type TuneFilter = {
  timeframe: TimeframeFilter;
  type: TuneTypeFilter;
};

type FilterState = {
  tunes: TuneFilter;
  sets: {
    timeframe: TimeframeFilter;
    type: TuneTypeFilter;
  };
  sessions: TimeframeFilter;
};

const FilterCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <Dropdown.Item onClick={onChange}>
    <Checkbox
      checked={checked}
      className="mr-2"
      onChange={(e) => {
        e.stopPropagation();
        onChange();
      }}
    />
    {label}
  </Dropdown.Item>
);

const ActionButtons = ({
  onPracticeOldest,
  onRandomPractice,
  showDropdown = false,
}: {
  onPracticeOldest: () => void;
  onRandomPractice: () => void;
  showDropdown?: boolean;
}) => {
  if (showDropdown) {
    return (
      <Dropdown label="Actions">
        <Dropdown.Item onClick={onPracticeOldest}>
          Practice Oldest
        </Dropdown.Item>
        <Dropdown.Item onClick={onRandomPractice}>
          Random Practice
        </Dropdown.Item>
      </Dropdown>
    );
  }

  return (
    <>
      <Button
        onClick={onPracticeOldest}
        className="bg-emerald-300 hover:enabled:bg-emerald-400"
      >
        Practice Oldest
      </Button>
      <Button
        onClick={onRandomPractice}
        className="bg-emerald-300 hover:enabled:bg-emerald-400"
      >
        Random Practice
      </Button>
    </>
  );
};

const FilterButtons = ({
  type,
  sortBy,
  setSortBy,
  filterBy,
  handleCheckboxClick,
  resetFilters,
  showDropdown = false,
}: {
  type: string;
  sortBy: any;
  setSortBy: (fn: (prev: any) => any) => void;
  filterBy: any;
  handleCheckboxClick: any;
  resetFilters: (type: string) => void;
  showDropdown?: boolean;
}) => {
  const timeframeAll =
    type === "tunes"
      ? filterBy.tunes.timeframe.all
      : type === "sets"
      ? filterBy.sets.timeframe.all
      : filterBy.sessions.all; // for sessions

  const content = (
    <>
      <Dropdown label="Sort By">
        <Dropdown.Item
          onClick={() => setSortBy((prev) => ({ ...prev, [type]: "name" }))}
        >
          Name
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => setSortBy((prev) => ({ ...prev, [type]: "newest" }))}
        >
          Newest
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => setSortBy((prev) => ({ ...prev, [type]: "oldest" }))}
        >
          Oldest
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() =>
            setSortBy((prev) => ({ ...prev, [type]: "lastPracticed" }))
          }
        >
          Last Practiced
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() =>
            setSortBy((prev) => ({ ...prev, [type]: "leastPracticed" }))
          }
        >
          Least Practiced
        </Dropdown.Item>
      </Dropdown>
      <Dropdown label="Filter By" dismissOnClick={false}>
        <div className="max-h-96 overflow-y-auto">
          <FilterCheckbox
            label="All Time"
            checked={timeframeAll}
            onChange={handleCheckboxClick(type, "timeframe", "all")}
          />
          <FilterCheckbox
            label="Last Week"
            checked={
              type === "sessions"
                ? filterBy.sessions.week
                : filterBy[type].timeframe.week
            }
            onChange={handleCheckboxClick(type, "timeframe", "week")}
          />
          <FilterCheckbox
            label="Last Month"
            checked={
              type === "sessions"
                ? filterBy.sessions.month
                : filterBy[type].timeframe.month
            }
            onChange={handleCheckboxClick(type, "timeframe", "month")}
          />
          <FilterCheckbox
            label="Unpracticed"
            checked={
              type === "sessions"
                ? filterBy.sessions.unpracticed
                : filterBy[type].timeframe.unpracticed
            }
            onChange={handleCheckboxClick(type, "timeframe", "unpracticed")}
          />

          {type === "tunes" && (
            <>
              <Dropdown.Divider />
              <Dropdown.Header>Tune Type</Dropdown.Header>
              <FilterCheckbox
                label="All Types"
                checked={filterBy.tunes.type.all}
                onChange={handleCheckboxClick("tunes", "type", "all")}
              />
              {TUNE_TYPES.map((tuneType) => (
                <FilterCheckbox
                  key={tuneType}
                  label={tuneType}
                  checked={filterBy.tunes.type[tuneType.toLowerCase()]}
                  onChange={handleCheckboxClick(
                    "tunes",
                    "type",
                    tuneType.toLowerCase()
                  )}
                />
              ))}
            </>
          )}

          {type === "sets" && (
            <>
              <Dropdown.Divider />
              <Dropdown.Header>Tune Type</Dropdown.Header>
              <FilterCheckbox
                label="All Types"
                checked={filterBy.sets.type.all}
                onChange={handleCheckboxClick("sets", "type", "all")}
              />
              {TUNE_TYPES.map((tuneType) => (
                <FilterCheckbox
                  key={tuneType}
                  label={tuneType}
                  checked={filterBy.sets.type[tuneType.toLowerCase()]}
                  onChange={handleCheckboxClick(
                    "sets",
                    "type",
                    tuneType.toLowerCase()
                  )}
                />
              ))}
            </>
          )}
        </div>
      </Dropdown>
      <Button
        className="bg-red-300 hover:enabled:bg-red-400"
        onClick={() => resetFilters(type)}
      >
        Reset
      </Button>
    </>
  );

  if (showDropdown) {
    return (
      <Dropdown label="Filters & Sort">
        <Dropdown.Item>{content}</Dropdown.Item>
      </Dropdown>
    );
  }

  return content;
};

const User = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = useRef("");
  const tabsRef = useRef<TabsRef>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemMemory, setItemMemory] = useState([[]]);
  const [sortBy, setSortBy] = useState({
    tunes: "name",
    sets: "name",
    sessions: "name",
  });
  const [filterBy, setFilterBy] = useState({
    tunes: {
      timeframe: { all: true, week: false, month: false, unpracticed: false },
      type: {
        all: true,
        reel: false,
        jig: false,
        hornpipe: false,
        "slip jig": false,
        polka: false,
        slide: false,
        waltz: false,
        mazurka: false,
        march: false,
        barndance: false,
        clog: false,
        air: false,
        "slow air": false,
        strathspey: false,
        other: false,
      },
    },
    sets: {
      timeframe: { all: true, week: false, month: false, unpracticed: false },
      type: {
        all: true,
        reel: false,
        jig: false,
        hornpipe: false,
        "slip jig": false,
        polka: false,
        slide: false,
        waltz: false,
        mazurka: false,
        march: false,
        barndance: false,
        clog: false,
        air: false,
        "slow air": false,
        strathspey: false,
        other: false,
      },
    },
    sessions: { all: true, week: false, month: false, unpracticed: false },
  });
  const [search, setSearch] = useState({ tunes: "", sets: "", sessions: "" });
  const [selectedTuneType, setSelectedTuneType] = useState<string>("");
  const [filterKey, setFilterKey] = useState(0); // Add state for filter key

  // Use the custom hook
  const { userData, tunes, sets, sessions, triggerDataFetch } = useUserData(id);

  useEffect(() => {
    const fetchData = async () => {
      const cookie = Cookies.get("user");
      const info = JSON.parse(cookie || "{}");
      userId.current = info.id || "";
      await triggerDataFetch("user");

      // Handle navigation based on URL parameters
      const type = searchParams.get("type");
      const itemId = searchParams.get("itemId");

      if (type) {
        if (itemId) {
          // Wait a brief moment to ensure data is loaded
          setTimeout(() => goTo(type, itemId), 100);
          let elementId = "";
          switch (type) {
            case "tune":
              elementId = "tu:" + itemId;
              break;
            case "set":
              elementId = "se:" + itemId;
              break;
            case "session":
              elementId = "sn:" + itemId;
              break;
          }
          highlightElement(elementId);
        } else {
          // Just switch to the appropriate tab
          switch (type) {
            case "tune":
              tabsRef.current?.setActiveTab(0);
              break;
            case "set":
              tabsRef.current?.setActiveTab(1);
              break;
            case "session":
              tabsRef.current?.setActiveTab(2);
              break;
          }
        }
      }
    };
    fetchData();
  }, [searchParams]); // Add searchParams as dependency

  const updateItemMemory = (type: string, id: string) => {
    setItemMemory((prevMemory) => {
      const newMemory = [...prevMemory, [type, id]];
      console.log("Updated Item Memory:", newMemory);
      return newMemory;
    });
  };

  const goBack = () => {
    setItemMemory((prevMemory) => {
      const newMemory = [...prevMemory];
      const item = newMemory.pop();
      console.log("Going back to:", item);
      if (item) {
        goTo(item[0], item[1]);
      }
      return newMemory;
    });
  };

  const highlightElement = (elementId: string) => {
    console.log("Highlighting element:", elementId);
    const element = document.getElementById(elementId);
    if (element) {
      console.log("Element found:", element);
      element.classList.add("border-green-500");
      element.classList.add("hover:border-green-800");
      console.log("Element classList:", element.classList);
      console.log("Element style:", element.style);
      console.log("Element highlighted!");
      setTimeout(() => {
        element.classList.remove("border-green-500");
        element.classList.remove("hover:border-green-800");
        console.log("Element unhighlighted!");
        console.log("Element style:", element.style);
      }, 5000); // Highlight for 5 seconds
    }
  };

  const updateUrl = (type: string, itemId?: string) => {
    const baseUrl = `/user/${id}?type=${type}`;
    navigate(itemId ? `${baseUrl}&itemId=${itemId}` : baseUrl, {
      replace: true,
    });
  };

  function goTo(type: string, itemId: string, resetFiltered: boolean = true) {
    if (resetFiltered) {
      // Reset filters and sort
      resetFilters("tunes");
      setSearch((prev) => ({ ...prev, tunes: "" }));
      resetFilters("sets");
      setSearch((prev) => ({ ...prev, sets: "" }));
      resetFilters("sessions");
      setSearch((prev) => ({ ...prev, sessions: "" }));
    }

    setSortBy(() => ({
      tunes: "name",
      sets: "name",
      sessions: "name",
    }));

    if (type === "tune") {
      tabsRef.current?.setActiveTab(0);
      const elementId = "tu:" + itemId;
      let index = searchItems(
        filterItems(sortItems(tunes, "tunes"), "tunes"),
        "tunes",
        search.tunes
      ).findIndex((item) => item.tuneId === itemId);

      if (index !== -1) {
        let paginationNumber = Math.floor(index / 21) + 1;
        setTimeout(() => {
          setCurrentPage(paginationNumber);
        }, 250);
        document
          .getElementById(elementId)
          ?.scrollIntoView({ behavior: "smooth" });
        updateUrl(type, itemId);
        setTimeout(() => {
          highlightElement(elementId);
        }, 500);
      }
    } else if (type === "set") {
      tabsRef.current?.setActiveTab(1);
      const elementId = "se:" + itemId;
      let index = searchItems(
        filterItems(sortItems(sets, "sets"), "sets"),
        "sets",
        search.sets
      ).findIndex((item) => item.setId === itemId);

      if (index !== -1) {
        let paginationNumber = Math.floor(index / 21) + 1;
        setTimeout(() => {
          setCurrentPage(paginationNumber);
        }, 250);
        document
          .getElementById(elementId)
          ?.scrollIntoView({ behavior: "smooth" });
        updateUrl(type, itemId);
        setTimeout(() => {
          highlightElement(elementId);
        }, 500);
      }
    } else if (type === "session") {
      tabsRef.current?.setActiveTab(2);
      const elementId = "sn:" + itemId;
      let index = searchItems(
        filterItems(sortItems(sessions, "sessions"), "sessions"),
        "sessions",
        search.sessions
      ).findIndex((item) => item.sessionId === itemId);

      if (index !== -1) {
        let paginationNumber = Math.floor(index / 21) + 1;
        setTimeout(() => {
          setCurrentPage(paginationNumber);
        }, 250);
        document
          .getElementById(elementId)
          ?.scrollIntoView({ behavior: "smooth" });
        updateUrl(type, itemId);
        setTimeout(() => {
          highlightElement(elementId);
        }, 500);
      }
    }
  }

  const practiceOldest = (items: any[], type: string) => {
    // Get filtered items first
    const filteredItems = filterItems(
      items,
      type === "tune" ? "tunes" : type + "s"
    );
    if (filteredItems.length === 0) return;

    const oldestItem = filteredItems.reduce((oldest, item) => {
      return !oldest ||
        new Date(item.lastPractice) < new Date(oldest.lastPractice)
        ? item
        : oldest;
    }, null);

    if (oldestItem) {
      switch (type) {
        case "tune":
          goTo(type, oldestItem.tuneId, false);
          break;
        case "set":
          goTo(type, oldestItem.setId, false);
          break;
        case "session":
          goTo(type, oldestItem.sessionId, false);
          break;
      }
    }
  };

  const randomPractice = (items: any[], type: string) => {
    // Get filtered items first
    const filteredItems = filterItems(
      items,
      type === "tune" ? "tunes" : type + "s"
    );
    if (filteredItems.length === 0) return;

    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    const randomItem = filteredItems[randomIndex];

    switch (type) {
      case "tune":
        goTo(type, randomItem.tuneId, false);
        break;
      case "set":
        goTo(type, randomItem.setId, false);
        break;
      case "session":
        goTo(type, randomItem.sessionId, false);
        break;
    }
  };

  const sortItems = (items: any[], type: string) => {
    const sorted = [...items];
    const sort = sortBy[type as keyof typeof sortBy];

    switch (sort) {
      case "name":
        switch (type) {
          case "tunes":
            return sorted.sort((a, b) => a.tuneName.localeCompare(b.tuneName));
          case "sets":
            return sorted.sort((a, b) => a.setName.localeCompare(b.setName));
          case "sessions":
            return sorted.sort((a, b) =>
              a.sessionName.localeCompare(b.sessionName)
            );
          default:
            return sorted;
        }
      case "newest":
        return sorted
          .sort(
            (a, b) =>
              new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          )
          .reverse();
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );
      case "lastPracticed":
        return sorted.sort(
          (a, b) =>
            new Date(b.lastPractice || 0).getTime() -
            new Date(a.lastPractice || 0).getTime()
        );
      case "leastPracticed":
        return sorted
          .sort(
            (a, b) =>
              new Date(b.lastPractice || 0).getTime() -
              new Date(a.lastPractice || 0).getTime()
          )
          .reverse();
      default:
        return sorted;
    }
  };

  const filterItems = (items: any[], type: string) => {
    console.log(`Filtering ${type} items...`);
    if (type === "tunes") {
      const filter = filterBy.tunes;

      // If "all" is selected for both timeframe and type, return all items
      if (filter.timeframe.all && filter.type.all) return items;

      return items.filter((item) => {
        // If lastPractice is missing, treat it as unpracticed
        if (!item.lastPractice) {
          if (!filter.timeframe.all && !filter.timeframe.unpracticed) {
            return false;
          }
          // still check type, if tunes/sets
          if (type === "tunes") {
            const typeMatch =
              filter.type.all ||
              Object.entries(filter.type)
                .filter(([key, value]) => key !== "all" && value)
                .some(
                  ([key]) => item.tuneType?.toLowerCase() === key.toLowerCase()
                );
            return typeMatch;
          }
        }

        // Check timeframe
        const timeframeMatch =
          filter.timeframe.all ||
          Object.entries(filter.timeframe)
            .filter(([key, value]) => key !== "all" && value)
            .some(([key]) => {
              const now = new Date();
              const lastPractice = new Date(item.lastPractice);
              const diffDays = Math.floor(
                (now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
              );

              switch (key) {
                case "week":
                  return diffDays <= 7;
                case "month":
                  return diffDays <= 30;
                case "unpracticed":
                  return !item.lastPractice;
                default:
                  return false;
              }
            });

        // Check type
        const typeMatch =
          filter.type.all ||
          Object.entries(filter.type)
            .filter(([key, value]) => key !== "all" && value)
            .some(
              ([key]) => item.tuneType?.toLowerCase() === key.toLowerCase()
            );

        console.log(
          `Tune ${item.tuneName} - Timeframe Match: ${timeframeMatch}, Type Match: ${typeMatch}`
        );
        return timeframeMatch && typeMatch;
      });
    }

    // For sets and sessions
    if (type === "sets") {
      const filter = filterBy.sets;

      // If "all" is selected for both timeframe and type, return all items

      if (filter.timeframe.all && filter.type.all) {
        console.log("All selected");
        return items;
      }

      return items.filter((set) => {
        // If lastPractice is missing, treat it as unpracticed
        if (!set.lastPractice) {
          if (!filter.timeframe.all && !filter.timeframe.unpracticed) {
            return false;
          }
          // still check type, if tunes/sets
          if (type === "sets") {
            const typeMatch =
              filter.type.all ||
              Object.entries(filter.type)
                .filter(([key, value]) => key !== "all" && value)
                .some(([key]) =>
                  set.tuneTypes
                    ?.map((t: string) => t.toLowerCase())
                    .includes(key)
                );
            return typeMatch;
          }
        }

        // Check timeframe
        const timeframeMatch =
          filter.timeframe.all ||
          Object.entries(filter.timeframe)
            .filter(([key, value]) => key !== "all" && value)
            .some(([key]) => {
              const now = new Date();
              const lastPractice = new Date(set.lastPractice);
              const diffDays = Math.floor(
                (now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
              );

              switch (key) {
                case "week":
                  return diffDays <= 7;
                case "month":
                  return diffDays <= 30;
                case "unpracticed":
                  return !set.lastPractice;
                default:
                  return false;
              }
            });

        // Check type
        const typeMatch =
          filter.type.all ||
          Object.entries(filter.type)
            .filter(([key, value]) => key !== "all" && value)
            .some(([key]) =>
              set.tuneTypes?.map((t: string) => t.toLowerCase()).includes(key)
            );

        console.log(
          `Set ${set.setName} - Timeframe Match: ${timeframeMatch}, Type Match: ${typeMatch}`
        );
        return timeframeMatch && typeMatch;
      });
    }

    const filter = filterBy[type as keyof typeof filterBy] as TimeframeFilter;
    if (filter?.all) return items;

    return items.filter((item) => {
      return Object.entries(filter)
        .filter(([key, value]) => key !== "all" && value)
        .some(([key]) => {
          const now = new Date();
          const lastPractice = new Date(item.lastPractice);
          const diffDays = Math.floor(
            (now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
          );

          switch (key) {
            case "week":
              return diffDays <= 7;
            case "month":
              return diffDays <= 30;
            case "unpracticed":
              return !item.lastPractice;
            default:
              return false;
          }
        });
    });
  };

  function handleFilterChange(
    type: string,
    category: string | null,
    value: string
  ) {
    // Map singular to plural
    if (type === "tune") type = "tunes";
    if (type === "set") type = "sets";
    if (type === "session") type = "sessions";

    setFilterBy((prev: FilterState) => {
      if (type === "tunes" || type === "sets") {
        if (!category) return prev;
        const newFilter = { ...prev };
        if (value === "all") {
          if (category === "timeframe") {
            newFilter[type].timeframe = {
              all: true,
              week: false,
              month: false,
              unpracticed: false,
            };
          } else {
            newFilter[type].type[value as keyof TuneTypeFilter] = false;
            newFilter[type].type["all"] = true;
          }
        } else {
          if (category === "timeframe") {
            const newTimeframe = {
              ...newFilter[type].timeframe,
              all: false,
              [value]:
                !newFilter[type].timeframe[value as keyof TimeframeFilter],
            };
            // If no timeframe is selected, set all to true
            if (
              !Object.entries(newTimeframe).some(
                ([key, value]) => key !== "all" && value
              )
            ) {
              newTimeframe.all = true;
            }
            newFilter[type].timeframe = newTimeframe;
          } else {
            const newType = {
              ...newFilter[type].type,
              all: false,
              [value]: !newFilter[type].type[value as keyof TuneTypeFilter],
            };
            // If no type is selected, set all to true
            if (
              !Object.entries(newType).some(
                ([key, value]) => key !== "all" && value
              )
            ) {
              newType.all = true;
            }
            newFilter[type].type = newType;
          }
        }
        return newFilter;
      } else {
        const targetFilter = prev[type as keyof typeof prev] as TimeframeFilter;
        const newFilter =
          value === "all"
            ? {
                all: true,
                week: false,
                month: false,
                unpracticed: false,
              }
            : {
                ...targetFilter,
                all: false,
                [value]: !targetFilter[value as keyof TimeframeFilter],
              };

        // If no filter is selected, set all to true
        if (
          !Object.entries(newFilter).some(
            ([key, value]) => key !== "all" && value
          )
        ) {
          newFilter.all = true;
        }

        return {
          ...prev,
          [type]: newFilter,
        };
      }
    });
    setFilterKey((prevKey) => prevKey + 1); // Increment filter key to force re-render
  }

  const handleCheckboxClick = (
    type: string,
    category: string | null,
    value: string
  ) => {
    return () => {
      handleFilterChange(type, category, value);
    };
  };

  const resetFilters = (type: string) => {
    setSortBy((prev) => ({ ...prev, [type]: "name" }));
    setFilterBy((prev) => {
      if (type === "tunes") {
        return {
          ...prev,
          tunes: {
            timeframe: {
              all: true,
              week: false,
              month: false,
              unpracticed: false,
            },
            type: {
              all: true,
              reel: false,
              jig: false,
              hornpipe: false,
              "slip jig": false,
              polka: false,
              slide: false,
              waltz: false,
              mazurka: false,
              march: false,
              barndance: false,
              clog: false,
              air: false,
              "slow air": false,
              strathspey: false,
              other: false,
            },
          },
        };
      } else if (type === "sets") {
        return {
          ...prev,
          sets: {
            timeframe: {
              all: true,
              week: false,
              month: false,
              unpracticed: false,
            },
            type: {
              all: true,
              reel: false,
              jig: false,
              hornpipe: false,
              "slip jig": false,
              polka: false,
              slide: false,
              waltz: false,
              mazurka: false,
              march: false,
              barndance: false,
              clog: false,
              air: false,
              "slow air": false,
              strathspey: false,
              other: false,
            },
          },
        };
      } else {
        return {
          ...prev,
          sessions: {
            all: true,
            week: false,
            month: false,
            unpracticed: false,
          },
        };
      }
    });
    setFilterKey((prevKey) => prevKey + 1); // Increment filter key to force re-render
  };

  const searchItems = (items: any[], type: string, searchTerm: string) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      switch (type) {
        case "tunes":
          return item.tuneName.toLowerCase().includes(term);
        case "sets":
          return item.setName.toLowerCase().includes(term);
        case "sessions":
          return item.sessionName.toLowerCase().includes(term);
        default:
          return true;
      }
    });
  };

  // Add this function
  const handleStateChange = async (type: string) => {
    // First, update the immediate item
    await triggerDataFetch();

    // If changing a set or session, we need to update tunes as well
    if (type === "set" || type === "session") {
      // Store current tab
      const currentTab = activeTab;

      // Switch to tunes tab temporarily
      tabsRef.current?.setActiveTab(0);
      await triggerDataFetch();

      // Switch back to original tab
      tabsRef.current?.setActiveTab(currentTab);
    }
  };

  const clearItemMemory = () => {
    setItemMemory([]);
  };

  const onPageChange = (page: number) => setCurrentPage(page);

  function handleTabChange(newTab: number) {
    setActiveTab(newTab);
    setCurrentPage(1); // Reset pagination
  }

  const filteredTunes = tunes.filter(
    (tune) => !selectedTuneType || tune.tuneType === selectedTuneType
  );

  const filteredSets = sets.filter(
    (set) => !selectedTuneType || set.tuneTypes?.includes(selectedTuneType)
  );

  return (
    <Frame>
      <div className="pt-4 pb-4 pr-1 pl-1 md:pr-10 md:pl-10 lg:pr-20 lg:pl-20">
        <div className="text-center text-green-500 pb-4 md:text-lg text-md">
          {id === userId.current ? (
            <h1>
              Welcome {userData.firstName} {userData.lastName}!
            </h1>
          ) : (
            <h1>
              {userData.firstName} {userData.lastName}'s Tunes
            </h1>
          )}
        </div>

        <Tabs
          aria-label="Tabs for Tunes, Sets, and Sessions"
          variant="fullWidth"
          ref={tabsRef}
          onActiveTabChange={(tab) => {
            handleTabChange(tab);
            const types = ["tune", "set", "session"];
            updateUrl(types[tab]);
          }}
        >
          {/* Tunes */}
          <Tabs.Item active title="Tunes">
            <div className="flex flex-row justify-between w-full gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {id === userId.current && (
                  <NewTune dataFetch={triggerDataFetch} goTo={goTo} />
                )}
                <TextInput
                  type="text"
                  placeholder="Search tunes..."
                  value={search.tunes}
                  onChange={(e) =>
                    setSearch((prev) => ({ ...prev, tunes: e.target.value }))
                  }
                />
              </div>

              {/* Show different layouts based on screen size */}
              <div className="hidden md:flex items-center gap-2">
                <ActionButtons
                  onPracticeOldest={() => practiceOldest(tunes, "tune")}
                  onRandomPractice={() => randomPractice(tunes, "tune")}
                />
                <FilterButtons
                  type="tunes"
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filterBy={filterBy}
                  handleCheckboxClick={handleCheckboxClick}
                  resetFilters={resetFilters}
                />
              </div>

              <div className="flex md:hidden items-center gap-2 w-full">
                <Accordion collapseAll className="w-full">
                  <Accordion.Panel>
                    <Accordion.Title className="text-sm py-2">
                      <div className="flex items-center gap-2">
                        <HiPlus className="h-4 w-4" />
                        More Options
                      </div>
                    </Accordion.Title>
                    <Accordion.Content>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 pb-2">
                          <Button
                            className="bg-emerald-300 hover:enabled:bg-emerald-400"
                            onClick={() => practiceOldest(tunes, "tune")}
                          >
                            Practice Oldest
                          </Button>
                          <Button
                            className="bg-emerald-300 hover:bg-emerald-400"
                            onClick={() => randomPractice(tunes, "tune")}
                          >
                            Random Practice
                          </Button>
                        </div>
                        <HR />
                        <div className="flex flex-col gap-2">
                          <Dropdown label="Sort By">
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "name",
                                }))
                              }
                            >
                              Name
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "newest",
                                }))
                              }
                            >
                              Newest
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "oldest",
                                }))
                              }
                            >
                              Oldest
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "lastPracticed",
                                }))
                              }
                            >
                              Last Practiced
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "leastPracticed",
                                }))
                              }
                            >
                              Least Practiced
                            </Dropdown.Item>
                          </Dropdown>
                          <Dropdown
                            label="Filter By"
                            className="bg-teal-300 hover:bg-teal-400"
                            dismissOnClick={false}
                          >
                            <div className="max-h-96 overflow-y-auto">
                              <FilterCheckbox
                                label="All Time"
                                checked={filterBy.tunes.timeframe.all}
                                onChange={handleCheckboxClick(
                                  "tunes",
                                  "timeframe",
                                  "all"
                                )}
                              />
                              <FilterCheckbox
                                label="Last Week"
                                checked={filterBy.tunes.timeframe.week}
                                onChange={handleCheckboxClick(
                                  "tunes",
                                  "timeframe",
                                  "week"
                                )}
                              />
                              <FilterCheckbox
                                label="Last Month"
                                checked={filterBy.tunes.timeframe.month}
                                onChange={handleCheckboxClick(
                                  "tunes",
                                  "timeframe",
                                  "month"
                                )}
                              />
                              <FilterCheckbox
                                label="Unpracticed"
                                checked={filterBy.tunes.timeframe.unpracticed}
                                onChange={handleCheckboxClick(
                                  "tunes",
                                  "timeframe",
                                  "unpracticed"
                                )}
                              />
                              <Dropdown.Divider />
                              <Dropdown.Header>Tune Type</Dropdown.Header>
                              <FilterCheckbox
                                label="All Types"
                                checked={filterBy.tunes.type.all}
                                onChange={handleCheckboxClick(
                                  "tunes",
                                  "type",
                                  "all"
                                )}
                              />
                              {TUNE_TYPES.map((tuneType) => (
                                <FilterCheckbox
                                  key={tuneType}
                                  label={tuneType}
                                  checked={
                                    filterBy.tunes.type[tuneType.toLowerCase()]
                                  }
                                  onChange={handleCheckboxClick(
                                    "tunes",
                                    "type",
                                    tuneType.toLowerCase()
                                  )}
                                />
                              ))}
                            </div>
                          </Dropdown>
                          <Button
                            onClick={() => resetFilters("tunes")}
                            className="bg-red-300 hover:enabled:bg-red-400"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
              </div>
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {searchItems(
                filterItems(sortItems(filteredTunes, "tunes"), "tunes"),
                "tunes",
                search.tunes
              )
                .slice((currentPage - 1) * 21, currentPage * 21)
                .map((tune) => (
                  <DisplayTune
                    key={`${tune.tuneId}-${filterKey}`} // Add key to force re-render
                    tune={tune}
                    userId={id}
                    dataFetch={triggerDataFetch}
                    goTo={goTo}
                    itemMemory={updateItemMemory}
                  ></DisplayTune>
                ))}
            </div>

            {/* Pagination */}
            {searchItems(
              filterItems(sortItems(filteredTunes, "tunes"), "tunes"),
              "tunes",
              search.tunes
            ).length > 21 && (
              <div className="flex overflow-x-auto sm:justify-center">
                <Pagination
                  layout="table"
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    searchItems(
                      filterItems(sortItems(filteredTunes, "tunes"), "tunes"),
                      "tunes",
                      search.tunes
                    ).length / 21
                  )}
                  onPageChange={onPageChange}
                  showIcons
                />
              </div>
            )}
          </Tabs.Item>

          {/* Sets */}
          <Tabs.Item title="Sets">
            <div className="flex flex-row justify-between w-full gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {id === userId.current && (
                  <NewSet
                    dataFetch={triggerDataFetch}
                    userTunes={tunes}
                    goTo={goTo}
                  />
                )}
                <TextInput
                  type="text"
                  placeholder="Search sets..."
                  value={search.sets}
                  onChange={(e) =>
                    setSearch((prev) => ({ ...prev, sets: e.target.value }))
                  }
                />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <ActionButtons
                  onPracticeOldest={() => practiceOldest(sets, "set")}
                  onRandomPractice={() => randomPractice(sets, "set")}
                />
                <FilterButtons
                  type="sets"
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filterBy={filterBy}
                  handleCheckboxClick={handleCheckboxClick}
                  resetFilters={resetFilters}
                />
              </div>

              <div className="flex md:hidden items-center gap-2 w-full">
                <Accordion collapseAll className="w-full">
                  <Accordion.Panel>
                    <Accordion.Title className="text-sm py-2">
                      <div className="flex items-center gap-2">
                        <HiPlus className="h-4 w-4" />
                        More Options
                      </div>
                    </Accordion.Title>
                    <Accordion.Content>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 pb-2">
                          <Button
                            className="bg-emerald-300 hover:enabled:bg-emerald-400"
                            onClick={() => randomPractice(sets, "set")}
                          >
                            Practice Oldest
                          </Button>
                          <Button
                            className="bg-emerald-300 hover:bg-emerald-400"
                            onClick={() => randomPractice(sets, "set")}
                          >
                            Random Practice
                          </Button>
                        </div>
                        <HR />
                        <div className="flex flex-col gap-2">
                          <Dropdown label="Sort By">
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sets: "name",
                                }))
                              }
                            >
                              Name
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sets: "newest",
                                }))
                              }
                            >
                              Newest
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sets: "oldest",
                                }))
                              }
                            >
                              Oldest
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sets: "lastPracticed",
                                }))
                              }
                            >
                              Last Practiced
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "leastPracticed",
                                }))
                              }
                            >
                              Least Practiced
                            </Dropdown.Item>
                          </Dropdown>
                          <Dropdown label="Filter By" dismissOnClick={false}>
                            <div className="max-h-96 overflow-y-auto">
                              <FilterCheckbox
                                label="All Time"
                                checked={filterBy.sets.timeframe.all}
                                onChange={handleCheckboxClick(
                                  "sets",
                                  "timeframe",
                                  "all"
                                )}
                              />
                              <FilterCheckbox
                                label="Last Week"
                                checked={filterBy.sets.timeframe.week}
                                onChange={handleCheckboxClick(
                                  "sets",
                                  "timeframe",
                                  "week"
                                )}
                              />
                              <FilterCheckbox
                                label="Last Month"
                                checked={filterBy.sets.timeframe.month}
                                onChange={handleCheckboxClick(
                                  "sets",
                                  "timeframe",
                                  "month"
                                )}
                              />
                              <FilterCheckbox
                                label="Unpracticed"
                                checked={filterBy.sets.timeframe.unpracticed}
                                onChange={handleCheckboxClick(
                                  "sets",
                                  "timeframe",
                                  "unpracticed"
                                )}
                              />
                              <Dropdown.Divider />
                              <Dropdown.Header>Tune Type</Dropdown.Header>
                              <FilterCheckbox
                                label="All Types"
                                checked={filterBy.sets.type.all}
                                onChange={handleCheckboxClick(
                                  "sets",
                                  "type",
                                  "all"
                                )}
                              />
                              {TUNE_TYPES.map((tuneType) => (
                                <FilterCheckbox
                                  key={tuneType}
                                  label={tuneType}
                                  checked={
                                    filterBy.sets.type[tuneType.toLowerCase()]
                                  }
                                  onChange={handleCheckboxClick(
                                    "sets",
                                    "type",
                                    tuneType.toLowerCase()
                                  )}
                                />
                              ))}
                            </div>
                          </Dropdown>
                          <Button
                            onClick={() => resetFilters("sets")}
                            className="bg-red-300 hover:enabled:bg-red-400"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
              </div>
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {searchItems(
                filterItems(sortItems(filteredSets, "sets"), "sets"),
                "sets",
                search.sets
              )
                .slice((currentPage - 1) * 21, currentPage * 21)
                .map((set) => (
                  <DisplaySet
                    key={`${set.setId}-${filterKey}`} // Add key to force re-render
                    set={set}
                    userId={id}
                    dataFetch={triggerDataFetch}
                    goTo={goTo}
                    itemMemory={updateItemMemory}
                    allTunes={tunes}
                  ></DisplaySet>
                ))}
            </div>

            {/* Pagination */}
            {searchItems(
              filterItems(sortItems(filteredSets, "sets"), "sets"),
              "sets",
              search.sets
            ).length > 21 && (
              <div className="flex overflow-x-auto sm:justify-center">
                <Pagination
                  layout="table"
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    searchItems(
                      filterItems(sortItems(filteredSets, "sets"), "sets"),
                      "sets",
                      search.sets
                    ).length / 21
                  )}
                  onPageChange={onPageChange}
                  showIcons
                />
              </div>
            )}
          </Tabs.Item>

          {/* Sessions */}
          <Tabs.Item title="Sessions">
            <div className="flex flex-row justify-between w-full gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {id === userId.current && (
                  <NewSession
                    dataFetch={triggerDataFetch}
                    userTunes={tunes}
                    userSets={sets}
                    goTo={goTo}
                  />
                )}
                <TextInput
                  type="text"
                  placeholder="Search sessions..."
                  value={search.sessions}
                  onChange={(e) =>
                    setSearch((prev) => ({ ...prev, sessions: e.target.value }))
                  }
                />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <ActionButtons
                  onPracticeOldest={() => practiceOldest(sessions, "session")}
                  onRandomPractice={() => randomPractice(sessions, "session")}
                />
                <FilterButtons
                  type="sessions"
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filterBy={filterBy}
                  handleCheckboxClick={handleCheckboxClick}
                  resetFilters={resetFilters}
                />
              </div>

              <div className="flex md:hidden items-center gap-2 w-full">
                <Accordion collapseAll className="w-full">
                  <Accordion.Panel>
                    <Accordion.Title className="text-sm py-2">
                      <div className="flex items-center gap-2">
                        <HiPlus className="h-4 w-4" />
                        More Options
                      </div>
                    </Accordion.Title>
                    <Accordion.Content>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 pb-2">
                          <Button
                            className="bg-emerald-300 hover:enabled:bg-emerald-400"
                            onClick={() => practiceOldest(sessions, "session")}
                          >
                            Practice Oldest
                          </Button>
                          <Button
                            className="bg-emerald-300 hover:enabled:bg-emerald-400"
                            onClick={() => practiceOldest(sessions, "session")}
                          >
                            Random Practice
                          </Button>
                        </div>
                        <HR />
                        <div className="flex flex-col gap-2">
                          <Dropdown label="Sort By">
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sessions: "name",
                                }))
                              }
                            >
                              Name
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sessions: "newest",
                                }))
                              }
                            >
                              Newest
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sessions: "oldest",
                                }))
                              }
                            >
                              Oldest
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  sessions: "lastPracticed",
                                }))
                              }
                            >
                              Last Practiced
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                setSortBy((prev) => ({
                                  ...prev,
                                  tunes: "leastPracticed",
                                }))
                              }
                            >
                              Least Practiced
                            </Dropdown.Item>
                          </Dropdown>
                          <Dropdown label="Filter By" dismissOnClick={false}>
                            <div className="max-h-96 overflow-y-auto">
                              <FilterCheckbox
                                label="All Time"
                                checked={filterBy.sessions.all}
                                onChange={handleCheckboxClick(
                                  "sessions",
                                  null,
                                  "all"
                                )}
                              />
                              <FilterCheckbox
                                label="Last Week"
                                checked={filterBy.sessions.week}
                                onChange={handleCheckboxClick(
                                  "sessions",
                                  null,
                                  "week"
                                )}
                              />
                              <FilterCheckbox
                                label="Last Month"
                                checked={filterBy.sessions.month}
                                onChange={handleCheckboxClick(
                                  "sessions",
                                  null,
                                  "month"
                                )}
                              />
                              <FilterCheckbox
                                label="Unpracticed"
                                checked={filterBy.sessions.unpracticed}
                                onChange={handleCheckboxClick(
                                  "sessions",
                                  null,
                                  "unpracticed"
                                )}
                              />
                            </div>
                          </Dropdown>
                          <Button
                            onClick={() => resetFilters("sessions")}
                            className="bg-red-300 hover:enabled:bg-red-400"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
              </div>
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {searchItems(
                filterItems(sortItems(sessions, "sessions"), "sessions"),
                "sessions",
                search.sessions
              )
                .slice((currentPage - 1) * 21, currentPage * 21)
                .map((session) => (
                  <DisplaySession
                    session={session}
                    userId={id}
                    dataFetch={triggerDataFetch}
                    goTo={goTo}
                    itemMemory={updateItemMemory}
                  ></DisplaySession>
                ))}
            </div>

            {/* Pagination */}
            {searchItems(
              filterItems(sortItems(sessions, "sessions"), "sessions"),
              "sessions",
              search.sessions
            ).length > 21 && (
              <div className="flex overflow-x-auto sm:justify-center">
                <Pagination
                  layout="table"
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    searchItems(
                      filterItems(sortItems(sessions, "sessions"), "sessions"),
                      "sessions",
                      search.sessions
                    ).length / 21
                  )}
                  onPageChange={onPageChange}
                  showIcons
                />
              </div>
            )}
          </Tabs.Item>
        </Tabs>
        {itemMemory.length > 1 && (
          <div className="flex flex-row justify-right gap-0 fixed bottom-10 left-4 py-2 px-4 rounded-tr-full rounded-br-full shadow-lg z-50">
            <Button
              onClick={clearItemMemory}
              className="bg-gray-400 hover:bg-gray-500"
            >
              <IoIosClose />
            </Button>
            <Button
              onClick={goBack}
              className=" bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </Frame>
  );
};

export default User;
