module.exports = () => {
  const now = new Date();
  const oneDayInMillis = 1 * 1.5 * 60 * 60 * 1000;

  return {
    CreateTask: {
      description: "This is a task description",
      userId: "test@doc.com",
      token: "_",
      dueDate: (now.getTime() + oneDayInMillis).toString(),
      optStatus: {
        type: "InProgress"
      }
    }
  };
};
