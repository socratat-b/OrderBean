"use client";

export default function HomePage() {
  const people = [
    { name: "John Doe", email: "john@example.com", role: "Developer" },
    { name: "Jane Smith", email: "jane@example.com", role: "Designer" },
    { name: "Bob Johnson", email: "bob@example.com", role: "Manager" },
    { name: "Alice Brown", email: "alice@example.com", role: "Developer" },
    { name: "Charlie Wilson", email: "charlie@example.com", role: "Designer" },
  ];

  return (
    <ul>
      {people.map((people, index) => (
        <li key={index} className="odd:border">
          {people.name}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <h1>Hello Order Bean </h1>

      <form action="">
        <label htmlFor="username">
          Username:
          <input type="text" name="username" id="username" />
        </label>
        <label htmlFor="email">
          Email:
          <input
            className="border valid:border-green-400 invalid:border-red-500 focus:outline-none"
            type="email"
            name="email"
            id="email"
          />
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          className="border-2 border-gray-300 placeholder-shown:text-green-500"
        />

        <input
          type="text"
          readOnly
          value="john@example.com"
          className="border-2 border-gray-300 read-only:cursor-not-allowed read-only:bg-gray-100"
        />

        <label className="block">
          <span className="text-gray-700 after:ml-0.5 after:text-red-500 after:content-['*']">
            Email
          </span>
          <input
            type="email"
            required
            className="border-2 border-gray-300 required:border-blue-300"
          />
        </label>
        <button
          disabled
          className="rounded px-6 py-2 disabled:cursor-not-allowed disabled:bg-yellow-500"
        >
          Submit
        </button>
      </form>
    </>
  );
}
