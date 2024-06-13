import { FormField, FormManifest, FormValidator } from "./models";
import { Grid, IconButton } from "@mui/material";

import { Add } from "@mui/icons-material";

//create Fields class component
function Hooks(props: {
  formManifest: FormManifest;
  updateManifest: (formManifest: FormManifest) => void;
}) {
  return (
    <Grid
      key="hooks"
      sx={{
        width: "100%",
        padding: "16px",
        marginBottom: "16px",
        "--Grid-borderWidth": "1px",
        borderTop: "var(--Grid-borderWidth) solid",
        borderLeft: "var(--Grid-borderWidth) solid",
        borderRight: "var(--Grid-borderWidth) solid",
        borderBottom: "var(--Grid-borderWidth) solid",
        borderColor: "divider",
      }}
      width={"100%"}
      gap={"16px"}
      spacing={"16px"}
      container
    >
      <Grid key="pre" width={"100%"} gap={"16px"} container>
        <Grid>
          <span>Add Pre Hook</span>
          <IconButton color="primary" onClick={() => {}}>
            <Add />
          </IconButton>
        </Grid>
      </Grid>
      <Grid key="post" width={"100%"} gap={"16px"} container>
        <Grid>
          <span>Add Post Hook</span>
          <IconButton color="primary" onClick={() => {}}>
            <Add />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Hooks;
