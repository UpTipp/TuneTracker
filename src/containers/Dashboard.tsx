import { useEffect, useState } from "react";
import Frame from "../components/Frame";
import { Avatar } from "flowbite-react";
import { Link } from "react-router-dom";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  picture: string;
  tuneCount?: number;
  dateAdded?: Date;
}

interface Tune {
  tuneId: string;
  tuneName: string;
  userId: string;
  tuneType: string;
  dateAdded: Date;
  firstName?: string;
  lastName?: string;
}

const Dashboard = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([]);
  const [newTunes, setNewTunes] = useState<Tune[]>([]);

  useEffect(() => {
    // Fetch top users
    fetch("/api/users-top")
      .then((res) => res.json())
      .then((data) => setTopUsers(data))
      .catch((err) => console.error("Error fetching top users:", err));

    // Fetch new users
    fetch("/api/users-new")
      .then((res) => res.json())
      .then((data) => setNewUsers(data))
      .catch((err) => console.error("Error fetching new users:", err));

    // Fetch new tunes
    fetch("/api/tunes-new")
      .then((res) => res.json())
      .then((data) => setNewTunes(data))
      .catch((err) => console.error("Error fetching new tunes:", err));
  }, []);

  return (
    <Frame>
      <div className="pt-4 pb-4 pr-1 pl-1 md:pr-10 md:pl-10 lg:pr-20 lg:pl-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Users */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Top Contributors</h2>
            <div className="space-y-4">
              {topUsers.map((user) => (
                <Link
                  to={`/user/${user.userId}`}
                  key={user.userId}
                  className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Avatar img={user.picture} rounded />
                  <div>
                    <p className="font-medium text-emerald-500">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.tuneCount} tunes
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Users */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">New Users</h2>
            <div className="space-y-4">
              {newUsers.map((user) => (
                <Link
                  to={`/user/${user.userId}`}
                  key={user.userId}
                  className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Avatar img={user.picture} rounded />
                  <div>
                    <p className="font-medium text-emerald-500">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(user.dateAdded!).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Tunes */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Recent Tunes</h2>
            <div className="space-y-4">
              {newTunes.map((tune) => (
                <Link
                  to={`/user/${tune.userId}?type=tune&itemId=${tune.tuneId}`}
                  key={tune.tuneId}
                  className="block border-b pb-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <p className="font-medium text-cyan-600">{tune.tuneName}</p>
                  <p className="text-sm text-gray-500">
                    {tune.tuneType} by{" "}
                    <span className="text-blue-500">
                      {tune.firstName} {tune.lastName}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Added {new Date(tune.dateAdded).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
};

export default Dashboard;
