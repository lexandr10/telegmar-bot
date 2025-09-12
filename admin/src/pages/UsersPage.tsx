import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import BlockIcon from "@mui/icons-material/Block";
import { listUsers, patchUser, type User } from "../api/users";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../hooks/useAuthMutation";
import { useMe } from "../hooks/useMe";

export default function UsersPage() {
	const [username, setUsername] = useState("");
	const nav = useNavigate();
  const logout = useLogoutMutation();
	const { data: me } = useMe();
	const [isAllowed, setIsAllowed] = useState<boolean | undefined>(undefined);
	const [status, setStatus] = useState<"all" | "pending" | "allowed">("all");

  const queryKey = useMemo(
    () =>
      [
        "users",
        { page: 1, limit: 50, username: username || undefined, isAllowed },
      ] as const,
    [username, isAllowed]
	);
	
	 const handleLogout = async () => {
     try {
       await logout.mutateAsync();
     } finally {
       qc.clear();
       nav("/login", { replace: true });
     }
   };

  const usersQ = useQuery({
    queryKey,
    queryFn: () =>
      listUsers({
        page: 1,
        limit: 50,
        username: username || undefined,
        isAllowed,
      }),
    placeholderData: (prev) => prev
  });

  const qc = useQueryClient();
  const mutateAllowed = useMutation({
    mutationFn: (vars: { id: string; allowed: boolean }) =>
      patchUser(vars.id, { isAllowed: vars.allowed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <Box p={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Users</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {me?.email && (
            <Typography variant="body2" sx={{ mr: 1, opacity: 0.8 }}>
              {me.email}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search username/telegram"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <ToggleButtonGroup
          size="small"
          exclusive
          value={status}
          onChange={(_, v) => v && setStatus(v)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="allowed">Allowed</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          onClick={() => usersQ.refetch()}
          disabled={usersQ.isFetching}
        >
          Refresh
        </Button>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Telegram ID</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Allowed</TableCell>
              <TableCell width={160}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(usersQ.data?.items || []).map((u: User) => (
              <TableRow key={u._id}>
                <TableCell>{u.username || "-"}</TableCell>
                <TableCell>{u.telegramId ?? "-"}</TableCell>
                <TableCell>
                  {u.roles.map((r) => (
                    <Chip key={r} label={r} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{String(u.isAllowed)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="success"
                      onClick={() =>
                        mutateAllowed.mutate({ id: u._id, allowed: true })
                      }
                      title="Allow"
                      disabled={mutateAllowed.isPending}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() =>
                        mutateAllowed.mutate({ id: u._id, allowed: false })
                      }
                      title="Block"
                      disabled={mutateAllowed.isPending}
                    >
                      <BlockIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
