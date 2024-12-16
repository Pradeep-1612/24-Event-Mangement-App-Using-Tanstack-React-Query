import { Link, Outlet, useParams, useNavigate } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteEventById,
  fetchEventById,
  queryClient,
} from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEventById({ signal, id: params.id }),
  });

  const [isDeleteRequested, setIsDeleteRequested] = useState(false);
  const {
    mutate,
    isPending: isDeletePending,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEventById,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });
  const navigate = useNavigate();

  function handleDeleteRequested() {
    setIsDeleteRequested(true);
  }

  function handleDeleteCancelled() {
    setIsDeleteRequested(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content = "";
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Loading event details...</p>
      </div>
    );
  }
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occurred"
          message={
            error.info?.message ||
            "Failed to fetch event details. Please try again later."
          }
        />
      </div>
    );
  }
  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDeleteRequested}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time
                dateTime={`Todo-DateT$Todo-Time`}
              >{`${formattedDate} @ ${data.time}`}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {isDeleteRequested && (
        <Modal onClose={handleDeleteCancelled}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isDeletePending && <p>Deleting, please wait...</p>}
            {!isDeletePending && (
              <>
                <button className="button-text" onClick={handleDeleteCancelled}>
                  Cancel
                </button>
                <button className="button" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
          {isDeleteError && (
            <ErrorBlock
              title="An error occurred during deletion"
              message={
                deleteError.info?.message ||
                "Failed to delete this event. Please try again later."
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
