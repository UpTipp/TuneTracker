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
  other: boolean;
};

type TuneFilter = {
  timeframe: TimeframeFilter;
  type: TuneTypeFilter;
};

type FilterState = {
  tunes: TuneFilter;
  sets: TimeframeFilter;
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

const User = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = useRef("");
  const tabsRef = useRef<TabsRef>(null);
  const [activeTab, setActiveTab] = useState(0);
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
        other: false,
      },
    },
    sets: { all: true, week: false, month: false, unpracticed: false },
    sessions: { all: true, week: false, month: false, unpracticed: false },
  });
  const [search, setSearch] = useState({ tunes: "", sets: "", sessions: "" });

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
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("border-green-500");
      setTimeout(() => {
        element.classList.remove("border-green-500");
      }, 3000);
    }
  };

  const updateUrl = (type: string, itemId?: string) => {
    const baseUrl = `/user/${id}?type=${type}`;
    navigate(itemId ? `${baseUrl}&itemId=${itemId}` : baseUrl, {
      replace: true,
    });
  };

  const goTo = (type: string, id: string) => {
    if (type === "tune") {
      tabsRef.current?.setActiveTab(0);
      const elementId = "tu:" + id;
      document.getElementById(elementId)?.scrollIntoView();
      highlightElement(elementId);
      updateUrl(type, id);
    } else if (type === "set") {
      tabsRef.current?.setActiveTab(1);
      const elementId = "se:" + id;
      document.getElementById(elementId)?.scrollIntoView();
      highlightElement(elementId);
      updateUrl(type, id);
    } else if (type === "session") {
      tabsRef.current?.setActiveTab(2);
      const elementId = "sn:" + id;
      document.getElementById(elementId)?.scrollIntoView();
      highlightElement(elementId);
      updateUrl(type, id);
    }
  };

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
          goTo(type, oldestItem.tuneId);
          break;
        case "set":
          goTo(type, oldestItem.setId);
          break;
        case "session":
          goTo(type, oldestItem.sessionId);
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
        goTo(type, randomItem.tuneId);
        break;
      case "set":
        goTo(type, randomItem.setId);
        break;
      case "session":
        goTo(type, randomItem.sessionId);
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
        return sorted.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );
      case "lastPracticed":
        return sorted.sort(
          (a, b) =>
            new Date(b.lastPractice).getTime() -
            new Date(a.lastPractice).getTime()
        );
      default:
        return sorted;
    }
  };

  const filterItems = (items: any[], type: string) => {
    if (type === "tunes") {
      const filter = filterBy.tunes;

      // If "all" is selected for both timeframe and type, return all items
      if (filter.timeframe.all && filter.type.all) return items;

      return items.filter((item) => {
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
            .some(([key]) => item.tuneType?.toLowerCase() === key);
        return timeframeMatch && typeMatch;
      });
    }

    // For sets and sessions
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

  const handleFilterChange = (
    type: string,
    category: string | null,
    value: string
  ) => {
    setFilterBy((prev: FilterState) => {
      if (type === "tunes") {
        if (!category) return prev;
        const newFilter = { ...prev };
        if (value === "all") {
          if (category === "timeframe") {
            newFilter.tunes.timeframe = {
              all: true,
              week: false,
              month: false,
              unpracticed: false,
            };
          } else {
            newFilter.tunes.type = {
              all: true,
              reel: false,
              jig: false,
              hornpipe: false,
              "slip jig": false,
              polka: false,
              slide: false,
              waltz: false,
              mazurka: false,
              other: false,
            };
          }
        } else {
          if (category === "timeframe") {
            const newTimeframe = {
              ...newFilter.tunes.timeframe,
              all: false,
              [value]:
                !newFilter.tunes.timeframe[value as keyof TimeframeFilter],
            };
            // If no timeframe is selected, set all to true
            if (
              !Object.entries(newTimeframe).some(
                ([key, value]) => key !== "all" && value
              )
            ) {
              newTimeframe.all = true;
            }
            newFilter.tunes.timeframe = newTimeframe;
          } else {
            const newType = {
              ...newFilter.tunes.type,
              all: false,
              [value]: !newFilter.tunes.type[value as keyof TuneTypeFilter],
            };
            // If no type is selected, set all to true
            if (
              !Object.entries(newType).some(
                ([key, value]) => key !== "all" && value
              )
            ) {
              newType.all = true;
            }
            newFilter.tunes.type = newType;
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
  };

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
              other: false,
            },
          },
        };
      } else {
        return {
          ...prev,
          [type]: { all: true, week: false, month: false, unpracticed: false },
        };
      }
    });
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
            setActiveTab(tab);
            const types = ["tune", "set", "session"];
            updateUrl(types[tab]);
          }}
        >
          {/* Tunes */}
          <Tabs.Item active title="Tunes">
            <div className="flex flex-row justify-between w-full gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <NewTune dataFetch={triggerDataFetch} />
                <TextInput
                  type="text"
                  placeholder="Search tunes..."
                  value={search.tunes}
                  onChange={(e) =>
                    setSearch((prev) => ({ ...prev, tunes: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => practiceOldest(tunes, "tune")}
                  className="ml-2"
                >
                  Practice Oldest
                </Button>
                <Button
                  onClick={() => randomPractice(tunes, "tune")}
                  className="ml-2"
                >
                  Random Practice
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Dropdown label="Sort By" className="ml-2">
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, tunes: "name" }))
                    }
                  >
                    Name
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, tunes: "newest" }))
                    }
                  >
                    Newest
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, tunes: "oldest" }))
                    }
                  >
                    Oldest
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, tunes: "lastPracticed" }))
                    }
                  >
                    Last Practiced
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown
                  label="Filter By"
                  className="ml-2"
                  dismissOnClick={false}
                >
                  <div className="max-h-96 overflow-y-auto">
                    <Dropdown.Header>Time Frame</Dropdown.Header>
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
                      onChange={handleCheckboxClick("tunes", "type", "all")}
                    />
                    <FilterCheckbox
                      label="Reel"
                      checked={filterBy.tunes.type.reel}
                      onChange={handleCheckboxClick("tunes", "type", "reel")}
                    />
                    <FilterCheckbox
                      label="Jig"
                      checked={filterBy.tunes.type.jig}
                      onChange={handleCheckboxClick("tunes", "type", "jig")}
                    />
                    <FilterCheckbox
                      label="Hornpipe"
                      checked={filterBy.tunes.type.hornpipe}
                      onChange={handleCheckboxClick(
                        "tunes",
                        "type",
                        "hornpipe"
                      )}
                    />
                    <FilterCheckbox
                      label="Slip Jig"
                      checked={filterBy.tunes.type["slip jig"]}
                      onChange={handleCheckboxClick(
                        "tunes",
                        "type",
                        "slip jig"
                      )}
                    />
                    <FilterCheckbox
                      label="Polka"
                      checked={filterBy.tunes.type.polka}
                      onChange={handleCheckboxClick("tunes", "type", "polka")}
                    />
                    <FilterCheckbox
                      label="Slide"
                      checked={filterBy.tunes.type.slide}
                      onChange={handleCheckboxClick("tunes", "type", "slide")}
                    />
                    <FilterCheckbox
                      label="Waltz"
                      checked={filterBy.tunes.type.waltz}
                      onChange={handleCheckboxClick("tunes", "type", "waltz")}
                    />
                    <FilterCheckbox
                      label="Mazurka"
                      checked={filterBy.tunes.type.mazurka}
                      onChange={handleCheckboxClick("tunes", "type", "mazurka")}
                    />
                    <FilterCheckbox
                      label="Other"
                      checked={filterBy.tunes.type.other}
                      onChange={handleCheckboxClick("tunes", "type", "other")}
                    />
                  </div>
                </Dropdown>
                <Button onClick={() => resetFilters("tunes")} className="ml-2">
                  Reset
                </Button>
              </div>
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {searchItems(
                filterItems(sortItems(tunes, "tunes"), "tunes"),
                "tunes",
                search.tunes
              ).map((tune) => (
                <DisplayTune
                  tune={tune}
                  userId={id}
                  dataFetch={triggerDataFetch}
                  goTo={goTo}
                  itemMemory={updateItemMemory}
                ></DisplayTune>
              ))}
            </div>
          </Tabs.Item>

          {/* Sets */}
          <Tabs.Item title="Sets">
            <div className="flex flex-row justify-between w-full gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <NewSet dataFetch={triggerDataFetch} userTunes={tunes} />
                <TextInput
                  type="text"
                  placeholder="Search sets..."
                  value={search.sets}
                  onChange={(e) =>
                    setSearch((prev) => ({ ...prev, sets: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => practiceOldest(sets, "set")}
                  className="ml-2"
                >
                  Practice Oldest
                </Button>
                <Button
                  onClick={() => randomPractice(sets, "set")}
                  className="ml-2"
                >
                  Random Practice
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Dropdown label="Sort By" className="ml-2">
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sets: "name" }))
                    }
                  >
                    Name
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sets: "newest" }))
                    }
                  >
                    Newest
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sets: "oldest" }))
                    }
                  >
                    Oldest
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sets: "lastPracticed" }))
                    }
                  >
                    Last Practiced
                  </Dropdown.Item>
                </Dropdown>
                <Dropdown
                  label="Filter By"
                  className="ml-2"
                  dismissOnClick={false}
                >
                  <div className="max-h-96 overflow-y-auto">
                    <FilterCheckbox
                      label="All Time"
                      checked={filterBy.sets.all}
                      onChange={handleCheckboxClick("sets", null, "all")}
                    />
                    <FilterCheckbox
                      label="Last Week"
                      checked={filterBy.sets.week}
                      onChange={handleCheckboxClick("sets", null, "week")}
                    />
                    <FilterCheckbox
                      label="Last Month"
                      checked={filterBy.sets.month}
                      onChange={handleCheckboxClick("sets", null, "month")}
                    />
                    <FilterCheckbox
                      label="Unpracticed"
                      checked={filterBy.sets.unpracticed}
                      onChange={handleCheckboxClick(
                        "sets",
                        null,
                        "unpracticed"
                      )}
                    />
                  </div>
                </Dropdown>
                <Button onClick={() => resetFilters("sets")} className="ml-2">
                  Reset
                </Button>
              </div>
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {searchItems(
                filterItems(sortItems(sets, "sets"), "sets"),
                "sets",
                search.sets
              ).map((set) => (
                <DisplaySet
                  set={set}
                  userId={id}
                  dataFetch={triggerDataFetch}
                  goTo={goTo}
                  itemMemory={updateItemMemory}
                ></DisplaySet>
              ))}
            </div>
          </Tabs.Item>

          {/* Sessions */}
          <Tabs.Item title="Sessions">
            <div className="flex flex-row justify-between w-full gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <NewSession
                  dataFetch={triggerDataFetch}
                  userTunes={tunes}
                  userSets={sets}
                />
                <TextInput
                  type="text"
                  placeholder="Search sessions..."
                  value={search.sessions}
                  onChange={(e) =>
                    setSearch((prev) => ({ ...prev, sessions: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => practiceOldest(sessions, "session")}
                  className="ml-2"
                >
                  Practice Oldest
                </Button>
                <Button
                  onClick={() => randomPractice(sessions, "session")}
                  className="ml-2"
                >
                  Random Practice
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Dropdown label="Sort By" className="ml-2">
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sessions: "name" }))
                    }
                  >
                    Name
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sessions: "newest" }))
                    }
                  >
                    Newest
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setSortBy((prev) => ({ ...prev, sessions: "oldest" }))
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
                </Dropdown>
                <Dropdown
                  label="Filter By"
                  className="ml-2"
                  dismissOnClick={false}
                >
                  <div className="max-h-96 overflow-y-auto">
                    <FilterCheckbox
                      label="All Time"
                      checked={filterBy.sessions.all}
                      onChange={handleCheckboxClick("sessions", null, "all")}
                    />
                    <FilterCheckbox
                      label="Last Week"
                      checked={filterBy.sessions.week}
                      onChange={handleCheckboxClick("sessions", null, "week")}
                    />
                    <FilterCheckbox
                      label="Last Month"
                      checked={filterBy.sessions.month}
                      onChange={handleCheckboxClick("sessions", null, "month")}
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
                  className="ml-2"
                >
                  Reset
                </Button>
              </div>
            </div>
            <HR className="my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {searchItems(
                filterItems(sortItems(sessions, "sessions"), "sessions"),
                "sessions",
                search.sessions
              ).map((session) => (
                <DisplaySession
                  session={session}
                  userId={id}
                  dataFetch={triggerDataFetch}
                  goTo={goTo}
                  itemMemory={updateItemMemory}
                ></DisplaySession>
              ))}
            </div>
          </Tabs.Item>
        </Tabs>
        {itemMemory.length > 1 && (
          <Button
            onClick={goBack}
            className="fixed bottom-10 left-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50"
          >
            Back
          </Button>
        )}
      </div>
    </Frame>
  );
};

export default User;
