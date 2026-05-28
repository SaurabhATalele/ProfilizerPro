export const deleteAssignment = async (id) => {
  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    body: JSON.stringify({ id: id }),
    redirect: "follow",
  };

  const response = await fetch(`${"/api/v1/assignment"}`, requestOptions);
  const data = await response.json();
  console.log(data);
  return data;
};
