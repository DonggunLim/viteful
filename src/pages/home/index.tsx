import { useEffect } from "react";

const HomePage = () => {
  const testFetch = async () => {
    try {
      const response = await fetch("/api/test");
      // console.log(response);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    testFetch();
  }, []);
  return (
    <>
      <h1>Home Page</h1>
    </>
  );
};

export default HomePage;
