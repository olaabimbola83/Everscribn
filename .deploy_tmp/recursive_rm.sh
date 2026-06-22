#!/bin/bash
set -e
HOST="everllub@server91.web-hosting.com"
PORT=21098
KEY="$HOME/.ssh/everscribn_cpanel"
ROOT="$1"

SFTP_OPTS=(-P "$PORT" -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)

declare -a FILES
declare -a DIRS

list_dir() {
  local path="$1"
  echo "ls -la \"$path\"" | sftp "${SFTP_OPTS[@]}" "$HOST" 2>/dev/null | grep -E '^[dl-][rwxst-]{9}'
}

# BFS queue
queue=("$ROOT")
while [ ${#queue[@]} -gt 0 ]; do
  current="${queue[0]}"
  queue=("${queue[@]:1}")
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    name=$(echo "$line" | awk '{for(i=9;i<NF;i++) printf $i" "; print $NF}')
    name=$(echo "$name" | sed 's/ *$//')
    [ "$name" = "." ] && continue
    [ "$name" = ".." ] && continue
    fullpath="$current/$name"
    if [[ "$line" == d* ]]; then
      DIRS+=("$fullpath")
      queue+=("$fullpath")
    else
      FILES+=("$fullpath")
    fi
  done < <(list_dir "$current")
done

echo "Discovered ${#FILES[@]} files and ${#DIRS[@]} directories under $ROOT"

BATCH="/tmp/rm_batch_$$.txt"
> "$BATCH"
for f in "${FILES[@]}"; do
  echo "rm \"$f\"" >> "$BATCH"
done
# delete deepest directories first
for d in $(printf '%s\n' "${DIRS[@]}" | awk '{print gsub(/\//,"/"), $0}' | sort -rn | cut -d' ' -f2-); do
  echo "rmdir \"$d\"" >> "$BATCH"
done
echo "rmdir \"$ROOT\"" >> "$BATCH"

echo "--- executing deletion batch ($(wc -l < "$BATCH") commands) ---"
sftp "${SFTP_OPTS[@]}" -b "$BATCH" "$HOST" 2>&1 | grep -Ei "failure|error|fatal|cannot" || echo "No errors reported."
rm -f "$BATCH"
