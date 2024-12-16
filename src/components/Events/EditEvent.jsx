import {
  Link,
  useNavigate,
  useParams,
  redirect,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEventById, queryClient, updateEvent } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEventById({ signal, id: params.id }),
    staleTime: 10000
  });
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const previousEvent = queryClient.getQueryData([
        "events",
        { id: params.id },
      ]);
      await queryClient.cancelQueries(["events", { id: params.id }]);
      queryClient.setQueryData(["events", { id: params.id }], data.event);

      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(
        ["events", { id: params.id }],
        context.previousEvent
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", { id: params.id }]);
    },
  });

  /* [Alternative approach]: We can also use `route action` concept to update the event details. */
  // const submit = useSubmit();

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");

    /* [Alternative approach]: We can also use `route action` concept to update the event details. */
    // submit(formData, {method: 'PUT'});
  }

  function handleClose() {
    navigate("../");
  }

  let content;
  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error occured"
          message={
            error.info?.message ||
            "Failed to fetch event details. Please try again with valid inputs."
          }
        ></ErrorBlock>
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}


/* [Alternative approach]: We can also use `route loader` concept to fetch the event detail. */
export function eventDetailLoader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEventById({ signal, id: params.id }),
  });
}

/* [Alternative approach]: We can also use `route action` concept to update the event details. */
export async function eventDetailUpdateAction({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
